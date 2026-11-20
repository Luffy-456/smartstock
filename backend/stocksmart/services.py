"""
Business logic services for StockSmart Inventory Management.
Handles atomic inventory movements, order fulfillment stock deduction,
PO receipt additions, transfers, and KPI calculations.
"""

from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from django.utils import timezone
from products.models import Product
from inventory.models import Location, InventoryItem, StockTransfer, StockAdjustment
from orders.models import Order
from suppliers.models import PurchaseOrder

class InventoryService:
    @staticmethod
    def get_or_create_inventory(product, location):
        item, _ = InventoryItem.objects.get_or_create(
            product=product,
            location=location,
            defaults={'quantity_on_hand': 0, 'quantity_reserved': 0}
        )
        return item

    @staticmethod
    @transaction.atomic
    def process_order_fulfillment(order: Order):
        """
        Deducts physical stock from the fulfillment location when order is confirmed/processing.
        """
        for item in order.items.select_related('product'):
            inv = InventoryService.get_or_create_inventory(item.product, order.location)
            if inv.quantity_on_hand < item.quantity:
                # Warning: Negative physical stock or low stock
                inv.quantity_on_hand = max(0, inv.quantity_on_hand - item.quantity)
            else:
                inv.quantity_on_hand -= item.quantity
            inv.save(update_fields=['quantity_on_hand', 'updated_at'])

    @staticmethod
    @transaction.atomic
    def cancel_order_restock(order: Order):
        """
        Returns items back to inventory if a confirmed order is cancelled.
        """
        for item in order.items.select_related('product'):
            inv = InventoryService.get_or_create_inventory(item.product, order.location)
            inv.quantity_on_hand += item.quantity
            inv.save(update_fields=['quantity_on_hand', 'updated_at'])

    @staticmethod
    @transaction.atomic
    def receive_purchase_order(purchase_order: PurchaseOrder):
        """
        Adds procured items into destination warehouse inventory upon receipt.
        """
        for po_item in purchase_order.items.select_related('product'):
            qty_to_add = po_item.quantity_received if po_item.quantity_received > 0 else po_item.quantity_ordered
            po_item.quantity_received = qty_to_add
            po_item.save(update_fields=['quantity_received'])

            inv = InventoryService.get_or_create_inventory(po_item.product, purchase_order.destination_location)
            inv.quantity_on_hand += qty_to_add
            inv.save(update_fields=['quantity_on_hand', 'updated_at'])

        purchase_order.status = PurchaseOrder.RECEIVED
        purchase_order.actual_delivery_date = timezone.now()
        purchase_order.save(update_fields=['status', 'actual_delivery_date'])

    @staticmethod
    @transaction.atomic
    def complete_stock_transfer(transfer: StockTransfer):
        """
        Deducts items from source location and adds them to target location.
        """
        for item in transfer.items.select_related('product'):
            qty = item.quantity
            item.received_quantity = qty
            item.save(update_fields=['received_quantity'])

            # Source deduction
            src_inv = InventoryService.get_or_create_inventory(item.product, transfer.from_location)
            src_inv.quantity_on_hand = max(0, src_inv.quantity_on_hand - qty)
            src_inv.save(update_fields=['quantity_on_hand', 'updated_at'])

            # Destination addition
            dest_inv = InventoryService.get_or_create_inventory(item.product, transfer.to_location)
            dest_inv.quantity_on_hand += qty
            dest_inv.save(update_fields=['quantity_on_hand', 'updated_at'])

        transfer.status = StockTransfer.COMPLETED
        transfer.completed_date = timezone.now()
        transfer.save(update_fields=['status', 'completed_date'])

    @staticmethod
    @transaction.atomic
    def apply_stock_adjustment(location, product, adjusted_quantity, reason, user, notes=""):
        inv = InventoryService.get_or_create_inventory(product, location)
        prev_qty = inv.quantity_on_hand
        diff = adjusted_quantity - prev_qty

        inv.quantity_on_hand = max(0, adjusted_quantity)
        inv.save(update_fields=['quantity_on_hand', 'updated_at'])

        adj_number = f"ADJ-{timezone.now().strftime('%Y%m%d%H%M%S')}-{product.id}"
        adjustment = StockAdjustment.objects.create(
            adjustment_number=adj_number,
            location=location,
            product=product,
            previous_quantity=prev_qty,
            adjusted_quantity=adjusted_quantity,
            difference=diff,
            reason=reason,
            adjusted_by=user,
            notes=notes
        )
        return adjustment


class AnalyticsService:
    @staticmethod
    def get_dashboard_kpis():
        """
        Computes key inventory performance indicators (KPIs):
        - Total inventory valuation (INR)
        - Total active SKUs
        - Low stock items count
        - Out of stock items count
        - Total sales orders
        - Total revenue (INR)
        - Inventory Turnover Ratio
        """
        total_skus = Product.objects.filter(status=Product.ACTIVE).count()
        
        # Calculate valuation = sum(quantity_on_hand * cost_price)
        inv_items = InventoryItem.objects.select_related('product').all()
        total_inventory_valuation = sum(
            (item.quantity_on_hand * item.product.cost_price) for item in inv_items
        )

        low_stock_count = 0
        out_of_stock_count = 0
        products = Product.objects.filter(status=Product.ACTIVE).prefetch_related('inventory_items')
        for p in products:
            stock = sum(i.quantity_on_hand for i in p.inventory_items.all())
            if stock == 0:
                out_of_stock_count += 1
            elif stock <= p.reorder_point:
                low_stock_count += 1

        orders = Order.objects.exclude(status=Order.CANCELLED)
        total_orders = orders.count()
        total_revenue = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # COGS (Cost of Goods Sold) approximation
        cogs = Decimal('0.00')
        from orders.models import OrderItem
        delivered_items = OrderItem.objects.filter(order__status__in=[Order.DELIVERED, Order.SHIPPED]).select_related('product')
        for item in delivered_items:
            cogs += item.quantity * item.product.cost_price

        # Turnover Ratio = COGS / Average Inventory (or current valuation)
        if total_inventory_valuation > 0:
            turnover_ratio = round(float(cogs / total_inventory_valuation), 2)
        else:
            turnover_ratio = 0.0

        return {
            'total_skus': total_skus,
            'total_inventory_valuation': float(total_inventory_valuation),
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'turnover_ratio': turnover_ratio,
            'cogs': float(cogs),
        }
