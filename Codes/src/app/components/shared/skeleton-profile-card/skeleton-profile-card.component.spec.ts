import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonProfileCardComponent } from './skeleton-profile-card.component';

describe('SkeletonProfileCardComponent', () => {
  let component: SkeletonProfileCardComponent;
  let fixture: ComponentFixture<SkeletonProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonProfileCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
