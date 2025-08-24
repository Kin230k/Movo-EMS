import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInterviewQuestionsComponent } from './create-interview-questions.component';

describe('CreateInterviewQuestionsComponent', () => {
  let component: CreateInterviewQuestionsComponent;
  let fixture: ComponentFixture<CreateInterviewQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInterviewQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInterviewQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
