from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):

    Role_CHOICES= [
        ('ADMIN','admin'),
        ('MANAGER','manager'),
        ('STAFF','staff'),

    ]

    email= models.EmailField(unique= True)
    phone=models.CharField(max_length= 20 ,blank= True)
    role = models.CharField(
        max_length= 20,
        choices=Role_CHOICES,
        default="STAFF"

    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at= models.DateTimeField(auto_now= True)

    def __str__(self):
        return f'{self.username} {self.role}'
    



