import { PageHeader, DocSection } from '../ui/DocKit';

export function StructureView() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Unity Project Structure" 
        subtitle="Directory layout and ScriptableObject data hierarchies."
      />

      <DocSection title="Folder Structure">
        <p>A scalable, module-first folder structure. All third-party plugins go into an isolated folder to prevent clutter.</p>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 font-mono text-sm mt-4 text-blue-300">
          Assets/<br/>
          ├── 📁 Art/<br/>
          │   ├── 📁 Animations/<br/>
          │   ├── 📁 Materials/<br/>
          │   └── 📁 Sprites/<br/>
          ├── 📁 Audio/<br/>
          ├── 📁 Prefabs/<br/>
          │   ├── 📁 UI/<br/>
          │   ├── 📁 NPCs/<br/>
          │   └── 📁 Environment/<br/>
          ├── 📁 Scenes/<br/>
          ├── 📁 ScriptableObjects/<br/>
          │   ├── 📁 Events/  # Event Channels<br/>
          │   ├── 📁 Items/   # Loot Tables<br/>
          │   └── 📁 Configs/ # Economy Balancers<br/>
          ├── 📁 Scripts/<br/>
          │   ├── 📁 Core/     # Managers, EventBus<br/>
          │   ├── 📁 AI/       # FSM, Pathfinding<br/>
          │   ├── 📁 UI/       # Views, Presenters<br/>
          │   └── 📁 Gameplay/ # Minigame logic<br/>
          └── 📁 ThirdParty/ # DoTween, Pathfinding, etc.<br/>
        </div>
      </DocSection>

      <DocSection title="Inspector Setup Rules">
        <ul className="list-disc pl-5 mt-4 text-slate-300 space-y-2">
          <li><strong>No Strings for Tags/Layers:</strong> We will use a static `GameConstants.cs` file rather than typing `"Player"` in the inspector to prevent runtime typos.</li>
          <li><strong>RequireComponent:</strong> All core logic scripts (e.g., `NPCMovement.cs`) must utilize `[RequireComponent(typeof(Rigidbody2D))]` to prevent assignment errors in prefabs.</li>
          <li><strong>Odin Inspector (Optional but Recommended):</strong> For the designer to easily author loot tables and NPC stats, installing Odin Inspector will save weeks of custom Unity Editor scripting.</li>
        </ul>
      </DocSection>
    </div>
  );
}
