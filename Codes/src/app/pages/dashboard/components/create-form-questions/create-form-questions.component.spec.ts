import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFormQuestionsComponent } from './create-form-questions.component';

describe('CreateInterviewQuestionsComponent', () => {
  let component: CreateFormQuestionsComponent;
  let fixture: ComponentFixture<CreateFormQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFormQuestionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFormQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
