import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDataManagementComponent } from './client-data-management.component';

describe('ClientDataManagementComponent', () => {
  let component: ClientDataManagementComponent;
  let fixture: ComponentFixture<ClientDataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDataManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
