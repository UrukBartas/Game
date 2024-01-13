import { Component, inject } from '@angular/core';
import { take } from 'rxjs';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit-character.component.html',
  styleUrls: ['./edit-character.component.scss'],
})
export class EditCharacterComponent {
  images = [
    'assets/free-portraits/knight.webp',
    'assets/free-portraits/knight-f.webp',
    'assets/free-portraits/bartender.webp',
    'assets/free-portraits/bartender-f.webp',
    'assets/free-portraits/blacksmith.webp',
    'assets/free-portraits/hairdresser.webp',
  ];

  selectedImage: string = 'assets/free-portraits/knight.webp';
  characterName: string = '';
  email: string = '';

  userService = inject(UserService);

  saveCharacter() {
    this.userService
      .createCharacter(this.email, this.characterName, this.selectedImage)
      .pipe(take(1))
      .subscribe(console.log);
  }
}
