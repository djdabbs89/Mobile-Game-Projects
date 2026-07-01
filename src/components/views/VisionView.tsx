import { PageHeader, DocSection, Callout, Card } from '../ui/DocKit';

export function VisionView() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Executive Game Vision" 
        subtitle="High-level project goals, demographic, and core technical pillars."
      />

      <DocSection title="The Hook">
        <p>
          <strong>Picky Pocket</strong> is a lighthearted stealth and skill-based pickpocketing simulation. 
          Players navigate procedurally generated crowded environments, identify wealthy targets, and execute high-risk steals right under their noses.
        </p>
        <Callout title="Tone Guideline" type="warning">
          The game must NOT glorify real-world crime. The tone should mirror rogue/thief archetypes in media: stylized, cartoon-like, and slightly ridiculous (think <em>Sly Cooper</em>, <em>Lupin III</em>, or <em>Thief Simulator</em>). It's an arcade experience, not a gritty crime sim.
        </Callout>
      </DocSection>

      <DocSection title="Target Audience & Platform">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card title="Platform">
            <ul className="list-disc pl-4 space-y-1">
              <li>Engine: Unity 6+</li>
              <li>OS: Android and iOS</li>
              <li>Orientation: Native Portrait</li>
              <li>Controls: Simple one-tap/hold touch controls</li>
            </ul>
          </Card>
          <Card title="Monetization & Economics">
            <ul className="list-disc pl-4 space-y-1">
              <li>Free-to-Play friendly</li>
              <li>Rewarded Ads (Bribe the cop, double loot)</li>
              <li>IAP (Premium equippable gloves, trails, emotes)</li>
              <li>Zero Pay-to-Win mechanics</li>
            </ul>
          </Card>
        </div>
      </DocSection>

      <DocSection title="Technical Design Philosophy">
        <p>
          As a mobile game planning for future live-ops (Leaderboards, Events), the architecture must be strictly modular from Day 1.
        </p>
        <ul className="list-disc pl-5 mt-4 space-y-2">
          <li><strong>ScriptableObject Data Store:</strong> Economy values, loot tables, and NPC archetypes will live purely in data containers, requiring zero code changes to tweak balance.</li>
          <li><strong>SOLID Principles:</strong> AI, UI, and Input will be strictly decoupled via an EventBus system.</li>
          <li><strong>Mobile Performance:</strong> Object Pooling is mandatory for NPCs and floating UI text. Static batching and simple lit shaders will keep frames at a locked 60fps.</li>
        </ul>
      </DocSection>

      <DocSection title="Recommended Art Direction">
        <p>
          I recommend a <strong>Crisp 2D Vector Art Style with Skeletal Animation (e.g., Spine2D)</strong>.
        </p>
        <Callout title="Why 2D Vector + Spine?" type="info">
          As a solo developer (or small team), producing full 3D animated crowds is expensive and slow. Using high-quality 2D vector art mapped to 2D skeletons allows us to procedurally swap outfit pieces (hats, watches, pants) on a single rig with minimal performance overhead. It also naturally forces the desired "cartoon/lighthearted" tone.
        </Callout>
      </DocSection>
    </div>
  );
}
