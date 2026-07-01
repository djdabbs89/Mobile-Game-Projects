import { PageHeader, DocSection, Card } from '../ui/DocKit';

export function BacklogView() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Sprint 1 Backlog" 
        subtitle="The MVP prototype scope. Weeks 1-2."
      />

      <DocSection title="Sprint Goal">
        <p className="text-lg">
          <strong>Goal:</strong> Prove the core loop is fun. 
          The player must be able to move in an empty gray-box room, initiate a steal on a primitive NPC block, and either succeed or fail based on timing.
        </p>
      </DocSection>

      <DocSection title="Development Tasks">
        <div className="space-y-4 mt-6">
          <Card title="🎫 Task 1: Basic Player Controller (Est. 4 hours)">
            <ul className="list-disc pl-5 text-slate-300">
              <li>Implement mobile-friendly virtual joystick / touch-to-move using Unity's New Input System.</li>
              <li>Setup basic collision physics using simple 2D capsules.</li>
              <li>Add placeholder Sprite for Player.</li>
            </ul>
          </Card>
          
          <Card title="🎫 Task 2: NPC Object & AI Base (Est. 8 hours)">
            <ul className="list-disc pl-5 text-slate-300">
              <li>Create base `NPCBehaviour` script.</li>
              <li>Implement placeholder FSM: States (Idle, Walk).</li>
              <li>NPC should randomly pick a point in a 5x5 radius and slowly walk to it.</li>
              <li>Add a visual "Vision Cone" using a simple Trigger 2D Polygon to detect the player.</li>
            </ul>
          </Card>

          <Card title="🎫 Task 3: The Pickpocket 'Trigger' (Est. 4 hours)">
            <ul className="list-disc pl-5 text-slate-300">
              <li>When player is 'behind' the NPC trigger zone, show a UI Prompt "Hold to Steal".</li>
              <li>Ensure prompt disappears if the player moves out of range or the NPC turns around.</li>
            </ul>
          </Card>

          <Card title="🎫 Task 4: UI Steal Minigame Logic (Est. 12 hours)">
            <ul className="list-disc pl-5 text-slate-300">
              <li>Create UI canvas overlaid on the NPC.</li>
              <li>Implement logic: Holding input fills `stealProgress` variable.</li>
              <li>Implement logic: NPC `awareness` variable wildly fluctuates on a timer.</li>
              <li>Win/Fail state triggers when `stealProgress == 100` OR `(isHolding AND awareness &gt; threshold)`.</li>
            </ul>
          </Card>
        </div>
      </DocSection>
    </div>
  );
}
