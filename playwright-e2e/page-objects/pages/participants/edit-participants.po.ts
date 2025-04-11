import { Base } from "../../base";

export class EditParticipantPage extends Base {
  readonly editParticipantHeader = this.page.getByText("Edit Participant", {
    exact: true,
  });
}
