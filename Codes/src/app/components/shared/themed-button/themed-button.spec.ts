import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemedButtonComponent } from './themed-button';

describe('Button', () => {
  let component: ThemedButtonComponent;
  let fixture: ComponentFixture<ThemedButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemedButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemedButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
