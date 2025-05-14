import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-crypt-fight',
  templateUrl: './crypt-fight.component.html',
  styleUrls: ['./crypt-fight.component.scss'],
})
export class CryptFightComponent implements OnInit {
  @Output() questStatusChange = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {
    // Automatically resolve fight after 3 seconds for a better visual experience
    setTimeout(() => {
      this.resolveFight();
    }, 3000);
  }

  private resolveFight(): void {
    this.questStatusChange.emit({ data: { status: 'COMPLETED' } });
  }
}
