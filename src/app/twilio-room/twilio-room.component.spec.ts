import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioRoomComponent } from './twilio-room.component';

describe('TwilioRoomComponent', () => {
  let component: TwilioRoomComponent;
  let fixture: ComponentFixture<TwilioRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwilioRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwilioRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
