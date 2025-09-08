import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQuestionsComponent } from './form-questions.component';

describe('CreateInterviewQuestionsComponent', () => {
  let component: FormQuestionsComponent;
  let fixture: ComponentFixture<FormQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormQuestionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
