import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFAComponent } from './app-two-f-a.component';

describe('AppTwoFAComponent', () => {
  let component: TwoFAComponent;
  let fixture: ComponentFixture<TwoFAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
