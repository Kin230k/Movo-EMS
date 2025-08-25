import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgerPassworComponent } from './forger-passwor.component';

describe('ForgerPassworComponent', () => {
  let component: ForgerPassworComponent;
  let fixture: ComponentFixture<ForgerPassworComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgerPassworComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgerPassworComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
