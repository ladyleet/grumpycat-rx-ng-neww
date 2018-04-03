import { TestBed, inject } from '@angular/core/testing';

import { CatfoodService } from './catfood.service';

describe('CatfoodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CatfoodService]
    });
  });

  it('should be created', inject([CatfoodService], (service: CatfoodService) => {
    expect(service).toBeTruthy();
  }));
});
