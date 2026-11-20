from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    ADMIN = 'Admin'
    WAREHOUSE_MANAGER = 'Warehouse Manager'
    STORE_ASSOCIATE = 'Store Associate'
    INVENTORY_AUDITOR = 'Inventory Auditor'

    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (WAREHOUSE_MANAGER, 'Warehouse Manager'),
        (STORE_ASSOCIATE, 'Store Associate'),
        (INVENTORY_AUDITOR, 'Inventory Auditor'),
    )

    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'
        ordering = ['id']

    def __str__(self):
        return self.name


class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    phone = models.CharField(max_length=20, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['id']

    def __str__(self):
        role_name = self.role.name if self.role else 'Unassigned'
        return f"{self.username} ({role_name})"

    @property
    def is_admin(self):
        return self.is_superuser or (self.role and self.role.name == Role.ADMIN)

    @property
    def is_warehouse_manager(self):
        return self.is_admin or (self.role and self.role.name == Role.WAREHOUSE_MANAGER)

    @property
    def is_store_associate(self):
        return self.is_admin or (self.role and self.role.name == Role.STORE_ASSOCIATE)
