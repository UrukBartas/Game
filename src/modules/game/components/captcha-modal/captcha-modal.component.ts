import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-captcha-modal',
  template: `
    <div id="captcha-modal">
      <div class="row">
        <p class="text-third" urTitle>Verify Action</p>
      </div>
      <div class="captcha-container">
        <div class="puzzle-container" *ngIf="!verified">
          <p class="text-white" urText>{{ captchaQuestion }}</p>
          <div class="options">
            <button 
              *ngFor="let option of options" 
              class="btn btn-secondary"
              [class.active]="selectedOption === option"
              (click)="checkAnswer(option)">
              {{ option }}
            </button>
          </div>
        </div>
        <div class="success-message" *ngIf="verified">
          <i class="fa fa-check-circle"></i>
          <p class="text-third" urText>Verified successfully!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../variables.scss';

    #captcha-modal {
      padding: 20px 40px;
      background: $black-300;
      border-radius: 10px;
      width: 80vw;
      max-width: 600px;
      text-wrap: wrap;
    }

    .captcha-container {
      padding: 20px 0;
      text-align: center;
    }

    .puzzle-container {
      margin-bottom: 20px;

      p {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
      }
    }

    .options {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;

      .btn {
        min-width: 120px;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;

        &.active {
          background: $third;
          border-color: $third;
          color: $black;
        }

        &:hover:not(.active) {
          background: $secondary;
          transform: translateY(-2px);
        }
      }
    }

    .success-message {
      color: $third;
      font-size: 24px;
      animation: fadeIn 0.5s ease;

      i {
        font-size: 48px;
        margin-bottom: 10px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CaptchaModalComponent implements OnInit {
  public captchaQuestion: string;
  public options: string[] = [];
  public correctAnswer: string;
  public verified = false;
  public selectedOption: string | null = null;

  constructor(public bsModalRef: BsModalRef) {}

  private puzzles = [
    {
        question: 'Why the blacksmith is so strong?',
        options: ['He goes to the crypt often', 'He lifts heavy weight', 'He screams a lot', 'He steals the Goblin'],
        answer: 'He lifts heavy weight'
      },
    {
      question: 'Select the monster type that drops magical essences',
      options: ['Giant Insect', 'Magic Beast', 'Undead', 'Dragon'],
      answer: 'Magic Beast'
    },
    {
      question: 'Which rarity takes the longest to complete?',
      options: ['Common', 'Uncommon', 'Epic', 'Mythic'],
      answer: 'Mythic'
    },
    {
      question: 'Select the basic action in quests',
      options: ['Craft', 'Fight', 'Trade', 'Sell'],
      answer: 'Fight'
    }
  ];

  ngOnInit() {
    this.setPuzzle();
  }

  private setPuzzle() {
    const puzzle = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    this.captchaQuestion = puzzle.question;
    this.options = puzzle.options;
    this.correctAnswer = puzzle.answer;
  }

  public checkAnswer(option: string) {
    this.selectedOption = option;
    if (option === this.correctAnswer) {
      this.verified = true;
      setTimeout(() => {
        this.bsModalRef.hide();
      }, 1000);
    } else {
      this.setPuzzle();
      this.selectedOption = null;
    }
  }

} 