import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormManagementComponent } from './form-management.component';

describe('FormManagementComponent', () => {
  let component: FormManagementComponent;
  let fixture: ComponentFixture<FormManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
