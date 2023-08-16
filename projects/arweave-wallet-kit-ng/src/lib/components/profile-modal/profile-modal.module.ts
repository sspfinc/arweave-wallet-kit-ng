import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ProfileModalComponent } from "./profile-modal.component";

@NgModule({
  declarations: [ProfileModalComponent],
  imports: [CommonModule, FormsModule],
  exports: [ProfileModalComponent],
})
export class AKNProfileModalModule {}
