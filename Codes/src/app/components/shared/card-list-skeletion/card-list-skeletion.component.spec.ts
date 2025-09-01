import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListSkeletionComponent } from './card-list-skeletion.component';

describe('CardListSkeletionComponent', () => {
  let component: CardListSkeletionComponent;
  let fixture: ComponentFixture<CardListSkeletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListSkeletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardListSkeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
