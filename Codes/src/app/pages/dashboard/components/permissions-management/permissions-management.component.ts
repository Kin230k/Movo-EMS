// permissions-management.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-permissions-management',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: 'permissions-management.component.html',
  styleUrls: ['./permissions-management.component.scss'],
})
export class PermissionsManagementComponent {}
