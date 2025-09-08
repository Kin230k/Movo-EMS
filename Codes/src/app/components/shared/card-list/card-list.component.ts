// src/app/card-list/card-list.component.ts
import { Component, Input, Type, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CardListComponent {
  @Input() items: any[] = [];

  /**
   * Pass the component class you want to use for each card.
   * Example: [cardComponent]="MyCustomCardComponent"
   * The passed component should be standalone or declared in an NgModule available to the app.
   */
  @Input() cardComponent?: Type<any> = undefined;

  /**
   * The name of the input on the card component that receives the item.
   * Defaults to 'data' (so card components should accept @Input() data: any).
   */
  @Input() cardInputKey = 'data';

  /**
   * Event emitted when a card component emits an event
   */
  @Output() cardEvent = new EventEmitter<{
    event: string;
    data: any;
    item: any;
  }>();

  // Build inputs object for ngComponentOutlet (computed to support dynamic key)
  inputsFor(item: any) {
    return { [this.cardInputKey]: item };
  }

  // Handle component creation and set up event listeners
  onComponentCreated(component: any, item: any) {
    if (component && component.formDeleted) {
      // Listen to formDeleted event from form card components
      component.formDeleted.subscribe((data: any) => {
        this.cardEvent.emit({
          event: 'formDeleted',
          data: data,
          item: item,
        });
      });
    }
  }

  // Handle events from dynamically rendered components
  onCardEvent(event: any, eventName: string, item: any) {
    this.cardEvent.emit({
      event: eventName,
      data: event,
      item: item,
    });
  }
}
