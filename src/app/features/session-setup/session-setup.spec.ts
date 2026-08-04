import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSetupComponent } from './session-setup';

describe('SessionSetupComponent', () => {
  let component: SessionSetupComponent;
  let fixture: ComponentFixture<SessionSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionSetupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSetupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
