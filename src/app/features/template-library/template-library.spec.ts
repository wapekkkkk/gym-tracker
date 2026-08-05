import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLibraryComponent } from './template-library';

describe('TemplateLibraryComponent', () => {
  let component: TemplateLibraryComponent;
  let fixture: ComponentFixture<TemplateLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateLibraryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateLibraryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});