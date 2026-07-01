import { PageHeader, DocSection, Callout, Card } from '../ui/DocKit';

export function ArchitectureView() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Technical Architecture" 
        subtitle="Systems architecture, Unity design patterns, and save strategies."
      />

      <DocSection title="Architecture Philosophy">
        <p>
          We will use a <strong>ScriptableObject (SO) Event-Driven Architecture</strong>.
          Instead of heavy singleton managers tightly coupling the codebase, systems will communicate by raising and listening to Game Events (SOs).
        </p>

        <Callout title="Why No MonoBehavior Singletons?" type="warning">
          Standard `GameManager.Instance.GiveMoney()` creates spaghetti dependencies that break scene reloading and make unit testing impossible. By using SO Game Events, the `PickpocketSystem` raises an `OnLootStolen` event, and the `EconomyManager` listens to it independently.
        </Callout>
      </DocSection>

      <DocSection title="Core Managers (Decoupled)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card title="GameManager (Stateless Flow)">
            Handles High-level state machine: `MainMenu` -{'>'} `Generation` -{'>'} `Playing` -{'>'} `GameOver`.
          </Card>
          <Card title="EconomyManager">
            Listens for Loot Events. Calculates value, checks player perks, and updates the local Save Data.
          </Card>
          <Card title="NPCManager (Object Pooler)">
            Handles spawning and despawning NPCs off-screen to maintain strict memory limits on mobile.
          </Card>
          <Card title="Player Controller">
            Handles touch inputs. Strictly reads from Input actions and moves the agent. Knows nothing about UI.
          </Card>
        </div>
      </DocSection>

      <DocSection title="AI State Machine (NPCs)">
        <p>NPCs will use a robust Hierarchical Finite State Machine (FSM). We will avoid update-heavy logic.</p>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm mt-4 text-emerald-400">
          State: IDLE<br/>
          ├── OnTimer(1s) -{'>'} Swap to State: WALK<br/>
          │<br/>
          State: WALK<br/>
          ├── Pathfind to Anchor Node<br/>
          ├── Event: OnPlayerCollision -{'>'} Swap to State: SUSPICIOUS<br/>
          │<br/>
          State: SUSPICIOUS<br/>
          ├── Start Awareness Timer<br/>
          ├── If timer `{'>'}` Max -{'>'} Swap to State: ALERT<br/>
          └── If player leaves `{'>'}` Swap to State: IDLE<br/>
          │<br/>
          State: ALERT<br/>
          └── Trigger Event: OnPoliceSummoned
        </div>
      </DocSection>

      <DocSection title="Save System & Cloud Sync">
        <ul className="space-y-4">
          <li><strong>Local Save:</strong> We will serialize pure C# structs to JSON and store via `Application.persistentDataPath`, appending a Hash to prevent cheap hex-editing hacks.</li>
          <li><strong>Versioning:</strong> Save files must include an `AppVersion` string. When loading an older version, a Migration script must run to map old data layouts to new fields.</li>
        </ul>
      </DocSection>
    </div>
  );
}
