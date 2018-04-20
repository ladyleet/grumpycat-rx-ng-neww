import { Component } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { CatfoodService } from './catfood.service';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { filter, mergeMap, switchMap, tap, takeUntil, map, scan, share, concatMap } from 'rxjs/operators';

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
  foodClick$ = new Subject<string>();

  hasBeenFedToGrumpyCat(x: number, y: number) {
    return x > 0 && x < 700 && y > 400 && y < 700
  };

  result$ = this.food$.pipe(
    switchMap(food =>
      this.catfood.getCatFood(food)
    ),
    tap((x) => console.log(x)),
    share()
  );

  found$ = this.foodClick$.pipe(
    concatMap(food => 
      this.catfood.hasCatFood(food))
  )

  counterCat$ = merge(
    this.increment$.pipe(
      filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
      filter((e) => e.target.matches('.🐟, .🌭, .🍔')),
    ),
      this.found$.pipe(
        filter(x => x)
      )
  ).pipe(
    scan(count => count + 1, 0)
  );

  catLikesDrag$ = this.increment$.pipe(
    filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
    filter(e => e.target.matches('.🍟, .🍕, .🍩, .🌮')),
  );

  catLikesSearch$ = this.result$.pipe(
    filter(foods => foods.some(x => x.value === 'pizza response' || x.value === 'fries response'))
  );

  counterYou$ = merge(this.catLikesDrag$, this.catLikesSearch$).pipe(
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

  showAlert$ = this.counterCat$.pipe(
    map((x) => x === 3),
    tap(x => x && alert("cat won!"))
  );

  constructor(public catfood: CatfoodService) {
  }

  ngOnInit() {
    this.subscription = new Subscription();

    this.subscription.add(this.mouseDrag$.subscribe(({ top, left, draggable }) => {
      draggable.style.top = top + 'px';
      draggable.style.left = left + 'px';
    }));
    this.subscription.add(this.showAlert$.subscribe());

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
};
