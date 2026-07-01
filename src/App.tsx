/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { VisionView } from './components/views/VisionView';
import { GDDView } from './components/views/GDDView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { StructureView } from './components/views/StructureView';
import { BacklogView } from './components/views/BacklogView';
import { PrototypeView } from './components/views/PrototypeView';
import { GameView } from './components/views/GameView';
import { TabId } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('vision');

  return (
    <div className="flex h-screen bg-[#08090A] font-sans selection:bg-cyan-500/30 text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-10 lg:p-16">
        {activeTab === 'vision' && <VisionView />}
        {activeTab === 'gdd' && <GDDView />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'structure' && <StructureView />}
        {activeTab === 'backlog' && <BacklogView />}
        {activeTab === 'prototype' && <PrototypeView />}
        {activeTab === 'game' && <GameView />}
      </main>
    </div>
  );
}

