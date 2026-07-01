import { PageHeader, DocSection, Callout, Card } from '../ui/DocKit';

export function GDDView() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Game Design Document" 
        subtitle="Core mechanics, loops, procedural generation, and monetization."
      />

      <DocSection title="Core Loop">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-4">
            <div className="flex-1 px-4 py-3 bg-indigo-500/20 text-indigo-300 rounded-lg">1. Scout District</div>
            <div className="text-slate-500 font-bold">→</div>
            <div className="flex-1 px-4 py-3 bg-amber-500/20 text-amber-300 rounded-lg">2. Pickpocket Minigame</div>
            <div className="text-slate-500 font-bold">→</div>
            <div className="flex-1 px-4 py-3 bg-rose-500/20 text-rose-300 rounded-lg">3. Escape / Fence Loot</div>
            <div className="text-slate-500 font-bold">→</div>
            <div className="flex-1 px-4 py-3 bg-green-500/20 text-green-300 rounded-lg">4. Unlock & Equip Gloves</div>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Pickpocket Minigame">
        <p>This is the core interaction. It must be repeatable, tense, and one-handed.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card title="Option 1: Pattern Tracing">
            Trace a line over the target's pocket without hitting the edges. Good, but limits screen visibility and frustrates clumsy thumbs on small phones.
          </Card>
          <Card title="Option 2: Risk-Reward Hold (Winner)">
            Hold the screen to fill the 'Steal Bar'. The NPC's 'Awareness' randomly spikes. The player must release the hold before the NPC is fully alert. High tension, perfect for portrait!
          </Card>
        </div>
        
        <div className="mt-4">
          <Callout title="Design Decision" type="success">
            We will move forward with <strong>Option 2: Risk-Reward Hold</strong>. It feels like "Red Light, Green Light". It's pure psychology, easy to monetize (e.g. "Buy a silencer glove to slow awareness"), and requires zero complex UI navigation.
          </Callout>
        </div>
      </DocSection>

      <DocSection title="Economy & Progression">
        <ul className="space-y-4">
          <li><strong>Soft Currency (Cash):</strong> Earned by stealing from NPCs. Used to buy new equippable gloves that provide passive bonuses.</li>
          <li><strong>Premium Currency (Diamonds):</strong> Rare drops or IAP. Used for purely cosmetic unlocks (Shiny trails, emotes) or skipping wait timers.</li>
          <li><strong>Achievements:</strong> Performing specific gameplay actions (getting caught, looting amounts, robbing cops) unlocks exclusive, powerful gloves.</li>
        </ul>

        <div className="bg-slate-800 p-4 rounded-lg mt-4 border border-slate-700">
          <h4 className="font-bold text-slate-200 mb-2">Gear Unlocks</h4>
          <p className="text-sm text-slate-400 mb-2">
            The game features unique equippable gloves, each with their own special gameplay effects. They are unlocked by accumulating cash or by completing in-game achievements.
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
            <li><strong>Basic Glove:</strong> Keeps hand-prints away.</li>
            <li><strong>Lucky Charm:</strong> Increases loot drops.</li>
            <li><strong>Phantom:</strong> Reduces awareness increase.</li>
            <li><strong>Crimson Rush:</strong> Grants faster movement speed.</li>
            <li><strong>Ninja Wrap:</strong> Speeds up stealing process and lowers awareness.</li>
            <li><strong>The Banker:</strong> Doubles loot from Businessmen.</li>
            <li><strong>Hacker:</strong> Massively boosts stealing speed.</li>
            <li><strong>Silencer:</strong> Massively reduces awareness increase.</li>
            <li><strong>Thief King:</strong> Boosts speed, steal rate, and loot (Achievement unlocked).</li>
            <li><strong>Pure Shadow:</strong> Extreme stealth enhancement (Achievement unlocked).</li>
          </ul>
        </div>
      </DocSection>

      <DocSection title="Endless Progression & Procedural Generation">
        <p>Instead of having levels to complete that increase in difficulty, the game operates as an "Endless" mode. As time progresses during a run, the difficulty ramps up proportionally.</p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-300">
          <li><strong>Dynamic Difficulty Ramping:</strong> NPC walking speeds, vision cones, and steal awareness rates increase smoothly based on time survived, offering a seamless challenge curve.</li>
          <li><strong>Endless Districts:</strong> The world is generated endlessly by assembling 2D background chunks (Downtown, Train Station). Unity will snap anchors together organically as the player moves.</li>
          <li><strong>NPC Generation:</strong> Created via Weighted Randomness. The game rolls for archetype (e.g., Tourist 60%, Businessman 30%, Cop 10%), then rolls for their loot table and walking path.</li>
          <li><strong>Events:</strong> A weather manager might roll a "Rainstorm" event upon district generation, shrinking NPC vision cones but making running louder.</li>
        </ul>
      </DocSection>
    </div>
  );
}
