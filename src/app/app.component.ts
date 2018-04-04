import { Component } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { CatfoodService } from './catfood.service';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { filter, mergeMap, switchMap, tap, takeUntil, map, scan } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  subscription: Subscription;
  mouseDown$ = fromEvent(document, 'mousedown');
  mouseMove$ = fromEvent(document, 'mousemove');
  mouseUp$ = fromEvent(document, 'mouseup');
  increment$ = new Subject<any>();
  food$ = new Subject<string>();
  
  hasBeenFedToGrumpyCat(x: number, y: number) {
    return x > 0 && x < 700 && y > 400 && y < 700
  };

  result$ = this.food$.pipe(
    switchMap(food =>
      this.catfood.getCatFood(food)
    ),
    map(foods => foods.join(', '))
  );

  counterCat$ = merge(
    this.increment$.pipe(
      filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
      filter((e) => e.target.matches('.🐟, .🌭, .🍔')),
    ),
    this.result$.pipe(
      filter(foods => foods.includes('burger response') || foods.includes('hot dog response') || foods.includes('goldfish response'))
    )
  ).pipe(
    scan(count => count + 1, 0)
  );

  counterYou$ = merge(
    this.increment$.pipe(
    filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
    filter(e => e.target.matches('.🍟, .🍕, .🍩, .🌮')),
  ),
    this.result$.pipe(
      filter(foods => foods.includes('pizza response') || foods.includes('fries response') || foods.includes('donut response') || foods.includes('taco response'))
    )
  ).pipe(
    scan(count => count + 1, 0)
  );

  targetMouseDown$ = this.mouseDown$.pipe(
    filter((e: any) => e.target.matches('.🍽'))
  )

  mouseDrag$ = this.targetMouseDown$.pipe(
    mergeMap(({ target: draggable, offsetX: startX, offsetY: startY }) =>
      this.mouseMove$.pipe(
        tap((mouseMoveEvent: any) => {
          mouseMoveEvent.preventDefault()
        }),
        map((mouseMoveEvent: any) => ({
          left: mouseMoveEvent.clientX - startX,
          top: mouseMoveEvent.clientY - startY,
          draggable
        })),
        takeUntil(this.mouseUp$.pipe(
          tap(this.increment$)
        ))
      )
    )
  );
  
  constructor(public catfood: CatfoodService) {
  }

  ngOnInit() {
    this.subscription = this.mouseDrag$.subscribe(({ top, left, draggable }) => {
      draggable.style.top = top + 'px';
      draggable.style.left = left + 'px';
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
};
