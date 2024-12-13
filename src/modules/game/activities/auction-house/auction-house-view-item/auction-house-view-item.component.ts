import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { filter, firstValueFrom, map, of, tap } from 'rxjs';
import { TimeAgoPipe } from 'src/app/time-ago.pipe';
import { environment } from 'src/environments/environment';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { getGenericItemItemData } from 'src/modules/utils';
import { AuctionHouseService } from 'src/services/auction-house.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-auction-house-view-item',
  templateUrl: './auction-house-view-item.component.html',
  styleUrl: './auction-house-view-item.component.scss',
})
export class AuctionHouseViewItemComponent {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;

  @Input() public set listing(data: MarketListing) {
    this._listing = data;
    this.getBids$ = this.auctionService.getBids(data.id);
    this.getHistoricalTrades$ = this.auctionService.getHistoricalTrades$(
      data.id
    );
    this.getPriceSeries$ = this.auctionService.getPriceSeries$(data.id).pipe(
      tap((e) => {
        this.createLineChart(e.series.reverse());
      })
    );
  }
  public get listing() {
    return this._listing;
  }
  public prefix = environment.permaLinkImgPref;
  public getBids$ = of([]);
  public getHistoricalTrades$ = of([]);
  public getPriceSeries$ = of({
    avg: 0,
    series: [],
  });
  chartOptions: any;
  private _listing: MarketListing;
  viewportService = inject(ViewportService);
  auctionService = inject(AuctionHouseService);
  private modalService = inject(BsModalService);
  public offerPrice = new FormControl(0);
  public addingOffer = false;
  toast = inject(ToastrService);
  store = inject(Store);
  modalRef = inject(BsModalRef);
  onAccept: Function;
  timeAgo = inject(TimeAgoPipe);
  public player$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player)
  );
  public getGenericItemItemData = getGenericItemItemData;
  getItemBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 200;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 60;
    }
  }
  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 30;
    }
    return 40;
  }

  createLineChart(series: { price: number; date: string }[]): void {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line', // Muestra solo la línea del puntero
        },
      },
      xAxis: {
        type: 'category',
        data: series.map((item) => new Date(item.date).toLocaleTimeString()), // Fechas como horas
        axisLine: {
          show: false, // Ocultar línea del eje X
        },
        axisTick: {
          show: false, // Ocultar marcas del eje X
        },
        axisLabel: {
          show: false, // Ocultar etiquetas del eje X
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false, // Ocultar línea del eje Y
        },
        axisTick: {
          show: false, // Ocultar marcas del eje Y
        },
        axisLabel: {
          show: false, // Ocultar etiquetas del eje Y
        },
        splitLine: {
          show: false, // Ocultar líneas de rejilla
        },
      },
      grid: {
        left: '0%', // Margen izquierdo eliminado
        right: '0%', // Margen derecho eliminado
        top: '0%', // Margen superior eliminado
        bottom: '0%', // Margen inferior eliminado
        containLabel: false, // No reservar espacio para etiquetas
      },
      series: [
        {
          type: 'line',
          data: series.map((item) => item.price), // Solo precios
          smooth: true, // Línea suave
          lineStyle: {
            color: '#8fb72a', // Color de la línea (terciario)
            width: 2, // Grosor de la línea
          },
          areaStyle: {
            color: 'rgba(143, 183, 42, 0.2)', // Área debajo de la línea
          },
          symbol: 'circle', // Puntos en la línea
          symbolSize: 6, // Tamaño de los puntos
          itemStyle: {
            color: '#8fb72a', // Color del punto
            borderColor: '#5b741a', // Borde secundario para los puntos
            borderWidth: 2, // Grosor del borde
          },
        },
      ],
    };
  }

  public async buy() {
    try {
      const bought = await firstValueFrom(
        this.auctionService.buy(this.listing.id)
      );
      this.toast.success(
        `Congratulations, you bought the item.`,
        'You have a new item in your inventory!'
      );
      if (this.onAccept) this.onAccept();
    } catch (error) {
      this.toast.error(`Error creating the trade ${error}`);
    }
    this.modalRef.hide();
  }

  public async cancel() {
    try {
      const bought = await firstValueFrom(
        this.auctionService.cancel(this.listing.id)
      );
      this.toast.info(
        `You cancelled the listing and the item have returned your inventory.`,
        'Listing cancelled!'
      );
      if (this.onAccept) this.onAccept();
    } catch (error) {
      this.toast.error(`Error cancelling the trade ${error}`);
    }
    this.modalRef.hide();
  }

  public async confirmOffer() {
    try {
      await firstValueFrom(
        this.auctionService.addNewOffer({
          idListing: this.listing.id,
          priceOffered: this.offerPrice.value,
        })
      );
      this.getBids$ = this.auctionService.getBids(this.listing.id);
      this.toast.info(`You created an offer for the listing.`, 'Offer added!');
      this.offerPrice.reset();
    } catch (error) {
      this.toast.error(`Error adding offer to the listing ${error}`);
    }
  }

  public async acceptOffer(idBid: number) {
    try {
      await firstValueFrom(
        this.auctionService.acceptOffer({
          idListing: this.listing.id,
          idBid: idBid,
        })
      );
      this.toast.info(`You accepted the offer.`, 'Offer accepted!');
      if (this.onAccept) this.onAccept();
      this.modalRef.hide();
    } catch (error) {
      this.toast.error(`Error accepting the offer ${error}`);
    }
  }

  public async cancelOffer(idBid: number) {
    try {
      await firstValueFrom(
        this.auctionService.cancelOffer({
          idBid: idBid,
        })
      );
      this.toast.info(`You canceled the offer.`, 'Offer canceled');
      this.getBids$ = this.auctionService.getBids(this.listing.id);
    } catch (error) {
      this.toast.error(`Error canceling the offer ${error}`);
    }
  }
}
