import { Idea, Connection } from '../types';

export const IDEAS: Idea[] = [
  {
    id: 'ptahhotep',
    title: 'Maxims of Ptahhotep',
    summary: 'One of the earliest written philosophical texts (~2400 BCE), presenting ethical maxims on right conduct, humility, and social harmony. Philosophy did not begin in Greece.',
    tradition: 'African',
    era: '~2400 BCE',
    originType: 'TEXT',
  },
  {
    id: 'ubuntu',
    title: 'Ubuntu Philosophy',
    summary: '"Umuntu ngumuntu ngabantu" — I am because we are. A pan-African ethic of communal interdependence: personhood is constituted through relationship, not prior to it.',
    tradition: 'African',
    era: 'Ancient–present',
    originType: 'ORAL',
  },
  {
    id: 'pre-socratic',
    title: 'Pre-Socratic Philosophy',
    summary: 'Heraclitus, Parmenides, Anaximander: the first Western thinkers to ask what the cosmos is made of and whether change is real. Heraclitus insists all is flux; Parmenides insists change is illusion.',
    tradition: 'Western',
    era: '~600–450 BCE',
    originType: 'TEXT',
  },
  {
    id: 'socratic',
    title: 'Socratic Dialectic',
    summary: 'The method of elenchus — questioning until contradiction is exposed. Knowledge not as possession but as the discovery of ignorance. Truth emerges from dialogue, not assertion.',
    tradition: 'Western',
    era: '~470–399 BCE',
    originType: 'TEXT',
  },
  {
    id: 'classical-dialectics',
    title: 'Classical Dialectics',
    summary: "Plato and Aristotle formalise dialectic as philosophy's highest method. Truth emerges from the collision of opposing positions. The Forms are reached through dialectical ascent.",
    tradition: 'Western',
    era: '~400–320 BCE',
    originType: 'TEXT',
  },
  {
    id: 'nagarjuna',
    title: 'Madhyamaka Dialectics',
    summary: "Nāgārjuna's middle way: all phenomena lack inherent existence (śūnyatā). Dialectical argumentation is used not to affirm a position but to exhaust all positions — a radical departure from Western dialectics.",
    tradition: 'South Asian',
    era: '~150 CE',
    originType: 'TEXT',
  },
  {
    id: 'hegelian',
    title: 'Hegelian Dialectics',
    summary: 'History as the self-unfolding of Geist through contradiction. Thesis meets antithesis; their conflict resolves into a higher synthesis. The rational is real; the real is rational.',
    tradition: 'Western',
    era: '1807',
    originType: 'TEXT',
  },
  {
    id: 'dialectical-mat',
    title: 'Dialectical Materialism',
    summary: "Marx and Engels invert Hegel: it is material conditions — labour, class, production — that drive history, not ideas. Contradictions of class produce the engine of historical change.",
    tradition: 'Western',
    era: '1845',
    originType: 'TEXT',
  },
  {
    id: 'anarchism',
    title: 'Anarchism',
    summary: "Proudhon, Bakunin, Kropotkin: the state is not a neutral tool for liberation — it is the problem. Seizing state power reproduces domination in a new form. Prefiguration over vanguardism.",
    tradition: 'Western',
    era: '1840s',
    originType: 'COLLECTIVE',
  },
  {
    id: 'marxism-leninism',
    title: 'Marxism-Leninism',
    summary: "Lenin's vanguard party as the necessary organisational form for revolution. The dictatorship of the proletariat is a transitional state, not a contradiction of Marxist ends.",
    tradition: 'Western',
    era: '1917',
    originType: 'COLLECTIVE',
  },
  {
    id: 'critical-theory',
    title: 'Critical Theory',
    summary: 'The Frankfurt School — Adorno, Horkheimer, Marcuse — apply dialectical materialism to culture. How does capitalism reproduce itself through consciousness, aesthetics, and desire?',
    tradition: 'Western',
    era: '1937',
    originType: 'COLLECTIVE',
  },
  {
    id: 'pragmatism',
    title: 'Pragmatism',
    summary: "James and Dewey: truth is what works. Philosophy must answer to experience, not derive from first principles. A distinctly American revolt against Hegelian abstraction — and against dogma of all kinds.",
    tradition: 'Western',
    era: '~1898',
    originType: 'TEXT',
  },
  {
    id: 'postcolonial',
    title: 'Postcolonial Theory',
    summary: "Fanon, Said, Spivak: the colonial wound is epistemic, not only economic. Reclaiming dialectics from the West means asking who was never included in its universalism — and who paid for it.",
    tradition: 'Global South',
    era: '1952',
    originType: 'COLLECTIVE',
  },
  {
    id: 'afrocentric',
    title: 'Afrocentric Philosophy',
    summary: "Asante, Diop: Africa must be placed at the centre of African peoples' analysis of history and knowledge. Not mere inversion of Eurocentrism — a distinct epistemological standpoint rooted in African agency.",
    tradition: 'African',
    era: '1970s',
    originType: 'COLLECTIVE',
  },
  {
    id: 'actor-network',
    title: 'Actor-Network Theory',
    summary: "Latour, Callon, Law: human and non-human actors form symmetrical networks. Agency is distributed — it belongs to associations, not individuals. Developed simultaneously by three people with no single author.",
    tradition: 'Western',
    era: '1980s',
    originType: 'COLLECTIVE',
  },
];

export const IDEAS_MAP = new Map<string, Idea>(IDEAS.map(i => [i.id, i]));

export const CONNECTIONS: Connection[] = [
  // African thread
  { id: 'c01', fromId: 'ptahhotep', toId: 'ubuntu', type: 'ORAL_TRADITION', confidence: 0.6, description: 'Transmitted and transformed across millennia of oral tradition' },
  { id: 'c02', fromId: 'ubuntu', toId: 'afrocentric', type: 'INFLUENCED', confidence: 0.8 },

  // Western classical thread
  { id: 'c03', fromId: 'pre-socratic', toId: 'socratic', type: 'INFLUENCED', confidence: 0.9 },
  { id: 'c04', fromId: 'socratic', toId: 'classical-dialectics', type: 'INFLUENCED', confidence: 0.95 },
  { id: 'c05', fromId: 'classical-dialectics', toId: 'hegelian', type: 'INFLUENCED', confidence: 0.9 },
  { id: 'c06', fromId: 'classical-dialectics', toId: 'nagarjuna', type: 'PARALLEL', confidence: 0.55, description: 'Both deploy dialectical refutation; neither knew the other' },

  // Hegel's tree
  { id: 'c07', fromId: 'hegelian', toId: 'dialectical-mat', type: 'INFLUENCED', confidence: 0.95, description: "Marx inverts Hegel's idealism — the motor is matter, not Geist" },
  { id: 'c08', fromId: 'hegelian', toId: 'pragmatism', type: 'INFLUENCED', confidence: 0.65, description: 'Pragmatism is partly a reaction against Hegelian abstraction' },
  { id: 'c09', fromId: 'pragmatism', toId: 'hegelian', type: 'CHALLENGED', confidence: 0.8, description: 'James rejects the Absolute; truth must be cashed out in experience' },
  { id: 'c10', fromId: 'nagarjuna', toId: 'hegelian', type: 'SILENT_INFLUENCE', confidence: 0.35, description: 'Hegel likely had no access to Nāgārjuna; convergence is independent' },

  // Dialectical materialism's tree
  { id: 'c11', fromId: 'dialectical-mat', toId: 'marxism-leninism', type: 'INFLUENCED', confidence: 0.9 },
  { id: 'c12', fromId: 'dialectical-mat', toId: 'critical-theory', type: 'INFLUENCED', confidence: 0.85 },
  { id: 'c13', fromId: 'dialectical-mat', toId: 'postcolonial', type: 'RECLAMATION', confidence: 0.8, description: 'Postcolonial thought reclaims and decolonises Marxist frameworks' },
  { id: 'c14', fromId: 'anarchism', toId: 'dialectical-mat', type: 'CHALLENGED', confidence: 0.85, description: 'Anarchism denies the state can be a vehicle for liberation' },
  { id: 'c15', fromId: 'marxism-leninism', toId: 'anarchism', type: 'CONTESTED', confidence: 0.9, description: 'Lenin vs. Bakunin: the vanguard party question tears the First International apart' },
  { id: 'c16', fromId: 'critical-theory', toId: 'dialectical-mat', type: 'CONTESTED', confidence: 0.65, description: 'Critical Theory resists crude economism and base/superstructure determinism' },

  // Convergences
  { id: 'c17', fromId: 'ubuntu', toId: 'actor-network', type: 'CONVERGENT', confidence: 0.6, description: 'Both dissolve the bounded individual into webs of relation — from very different starting points' },
  { id: 'c18', fromId: 'postcolonial', toId: 'afrocentric', type: 'INFLUENCED', confidence: 0.7 },
  { id: 'c19', fromId: 'critical-theory', toId: 'postcolonial', type: 'INFLUENCED', confidence: 0.6, description: 'Postcolonial theorists read but also contest the Frankfurt School' },
];
