import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-character-selector',
  templateUrl: './character-selector.component.html',
  styleUrl: './character-selector.component.scss',
})
export class CharacterSelectorComponent {
  modalRef = inject(BsModalRef);
  characters = [
    {
      img: 'assets/free-portraits/warlock.webp',
      name: 'Orgok Bloody-Eyes (Warlock)',
      description:
        `Once a fierce and loyal warrior of his tribe, Thragor made a fateful pact with a dark entity in exchange for the power to save his people from destruction. Now, bound to the will of a malevolent demon lord, he wields chaotic fire magic with terrifying force. Though his people view him as a savior, Thragor wrestles daily with the growing corruption of his soul, knowing that one day, the price of his power will come due.`
    },
    {
      img: 'assets/free-portraits/rogue.webp',
      name: 'Nyx (Rogue)',
      description:
        `Nyx was once an unwilling child prisoner of a dark cult that exploited orphans, forcing them to worship an ancient evil. Trained in stealth and manipulation to serve the cult's sinister purposes, she ultimately rebelled and escaped their clutches. Now haunted by the memories of those left behind, Nyx works as a rogue-for-hire, using her skills to unravel the cult's hidden operations from the shadows. She walks a thin line between justice and vengeance, determined to destroy the evil that still seeks to reclaim her.`,
    },
    {
      img: 'assets/free-portraits/warrior.webp',
      name: 'Tulkas Battlehorn (Warrior)',
      description:
        `Tulkas hails from the mountain kingdom of Karak Grim, where the dwarves live and die by the blade. A seasoned warrior, Tulkas has seen countless battles, wielding his massive warhammer, "Stonebreaker," with unyielding strength. Known for his stubborn loyalty and fierce protectiveness of his kin, he fights not only for glory but to reclaim the lost relics of his ancestors, which were plundered by ancient foes long ago.`,
    },
    {
      img: 'assets/free-portraits/mage.webp',
      name: 'Elaris Starweeper (Mage)',
      description:
        `Elaris is a scholar of the arcane, born into an ancient lineage of elves who have long guarded the secrets of elemental magic. With his silver hair and piercing violet eyes, Elaris commands the forces of fire, water, and wind with ease. His quest is to unravel a mysterious prophecy that foretells the return of a cataclysmic event that once nearly wiped out the elven race. Driven by knowledge and a deep sense of duty, he ventures far from his homeland, seeking wisdom to prevent the disaster from coming to pass again.`
    },
  ];
  selectedCharacter: string = this.modalRef.content.data.image;
}
