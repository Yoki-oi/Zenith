import { Subject, Chapter } from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

function ch(title: string, desc = '', chemSection?: 'Physical' | 'Organic' | 'Inorganic'): Chapter {
  return {
    id: uid(),
    title,
    desc,
    doing: false,
    done: false,
    mastered: false,
    revisions: 0,
    items: [
      { id: uid(), label: 'Lectures', done: false },
      { id: uid(), label: 'DPPs', done: false },
    ],
    chemSection: chemSection || null,
    open: false,
  };
}

export const CHEM_SECTIONS: Array<'Physical' | 'Organic' | 'Inorganic'> = ['Physical', 'Organic', 'Inorganic'];
export const CHEM_LABELS = { Physical: 'Physical Chemistry', Organic: 'Organic Chemistry', Inorganic: 'Inorganic Chemistry' };

export function buildSeedData(): Subject[] {
  return [
    // Class 11 Physics
    {
      id: uid(),
      name: 'Physics',
      icon: 'atom',
      color: '#3b82f6',
      classNum: 11,
      type: 'normal',
      chapters: [
        ch('Units, Dimensions & Error Analysis', 'SI units, dimensional analysis, significant figures'),
        ch('Kinematics (1D & 2D)', 'SUVAT, projectile, relative motion'),
        ch('Laws of Motion', "Newton's 3 laws, friction, pseudo force"),
        ch('Work, Energy & Power', 'Work-energy theorem, conservation, potential energy'),
        ch('Rotational Mechanics', 'Torque, MOI, angular momentum, rolling'),
        ch('Gravitation', "Kepler's laws, orbital velocity, escape velocity"),
        ch('Simple Harmonic Motion', 'Spring-mass, simple pendulum, energy in SHM'),
        ch('Mechanical Properties of Solids', "Stress, strain, Young's modulus, elasticity"),
        ch('Fluid Mechanics', 'Pressure, Bernoulli, viscosity, surface tension'),
        ch('Thermal Properties & Calorimetry', 'Specific heat, latent heat, thermal expansion'),
        ch('Thermodynamics', '1st & 2nd laws, processes, Carnot engine'),
        ch('Kinetic Theory of Gases', 'KTG, degrees of freedom, equipartition'),
        ch('Waves & Sound', 'Wave equation, superposition, Doppler effect'),
      ],
    },
    // Class 11 Chemistry
    {
      id: uid(),
      name: 'Chemistry',
      icon: 'flask',
      color: '#8b5cf6',
      classNum: 11,
      type: 'chemistry',
      chapters: [
        ch('Mole Concept & Stoichiometry', 'Molarity, molality, equivalent concept', 'Physical'),
        ch('Atomic Structure', 'Bohr model, quantum numbers, orbitals', 'Physical'),
        ch('Chemical Thermodynamics', 'Enthalpy, entropy, Gibbs energy', 'Physical'),
        ch('States of Matter', 'Ideal gas, van der Waals, liquefaction', 'Physical'),
        ch('Chemical Equilibrium', 'Kp, Kc, Le Chatelier, degree of dissociation', 'Physical'),
        ch('Ionic Equilibrium & pH', 'Buffer, hydrolysis, solubility product', 'Physical'),
        ch('Redox Reactions', 'Oxidation states, balancing, disproportionation', 'Physical'),
        ch('IUPAC Nomenclature & Isomerism', 'Structural, stereoisomerism, E-Z, R-S', 'Organic'),
        ch('General Organic Chemistry (GOC)', 'Inductive, resonance, hyperconjugation, carbocations', 'Organic'),
        ch('Hydrocarbons', 'Alkanes, alkenes, alkynes, arenes', 'Organic'),
        ch('Periodic Table & Periodicity', 'Blocks, periodic trends, effective nuclear charge', 'Inorganic'),
        ch('Chemical Bonding & Molecular Structure', 'VSEPR, VBT, MOT, hybridisation', 'Inorganic'),
        ch('s-Block Elements', 'Li, Na, K, Mg, Ca properties & uses', 'Inorganic'),
        ch('p-Block Elements (13 & 14)', 'B, Al, C, Si group compounds', 'Inorganic'),
      ],
    },
    // Class 11 Mathematics
    {
      id: uid(),
      name: 'Mathematics',
      icon: 'sigma',
      color: '#22c55e',
      classNum: 11,
      type: 'normal',
      chapters: [
        ch('Sets, Relations & Functions', 'Set ops, types of relations, invertible functions'),
        ch('Complex Numbers & Quadratic Equations', 'Argand plane, modulus, quadratic roots'),
        ch('Permutations & Combinations', 'nPr, nCr, counting principles'),
        ch('Binomial Theorem', 'General term, middle term, properties'),
        ch('Sequences & Series', 'AP, GP, AGP, special series'),
        ch('Straight Lines', 'Slope, various forms, distance, locus'),
        ch('Conic Sections', 'Circle, parabola, ellipse, hyperbola'),
        ch('Introduction to 3D Geometry', 'Axes, planes, distance formula'),
        ch('Limits & Derivatives', "L'Hopital, sandwich theorem, first principle"),
        ch('Trigonometric Functions', 'All identities, graphs, inverse trig'),
        ch('Mathematical Induction', 'PMI, base case, inductive step'),
        ch('Linear Inequalities', 'Graphical & algebraic solution'),
        ch('Statistics', 'Mean, variance, standard deviation'),
        ch('Probability (Basics)', 'Classical, axiomatic, addition theorem'),
      ],
    },
    // Class 12 Physics
    {
      id: uid(),
      name: 'Physics',
      icon: 'atom',
      color: '#3b82f6',
      classNum: 12,
      type: 'normal',
      chapters: [
        ch('Electrostatics', "Coulomb's law, electric field, Gauss's law, potential"),
        ch('Electric Potential & Capacitance', 'Potential energy, equipotential, capacitors, dielectrics'),
        ch('Current Electricity', "Ohm's law, Kirchhoff's laws, Wheatstone, potentiometer"),
        ch('Moving Charges & Magnetism', 'Biot-Savart, Ampere, cyclotron, galvanometer'),
        ch('Magnetism & Magnetic Materials', "Bar magnet, Earth's field, diamag/paramag/ferromag"),
        ch('Electromagnetic Induction', 'Faraday, Lenz, motional EMF, self & mutual inductance'),
        ch('Alternating Current', 'RMS, phasors, LCR circuits, resonance, power factor'),
        ch('Electromagnetic Waves', 'Maxwell equations, EM spectrum, displacement current'),
        ch('Ray Optics & Optical Instruments', 'Mirrors, lenses, TIR, prism, eye, microscope, telescope'),
        ch('Wave Optics', "Huygens' principle, interference, diffraction, polarisation"),
        ch('Dual Nature of Radiation & Matter', 'Photoelectric effect, de Broglie, Davisson-Germer'),
        ch('Atoms', "Rutherford, Bohr's model, hydrogen spectrum, energy levels"),
        ch('Nuclei', 'Radioactivity, nuclear reactions, fission, fusion, binding energy'),
        ch('Semiconductor Devices', 'p-n junction, diodes, transistors, logic gates'),
      ],
    },
    // Class 12 Chemistry
    {
      id: uid(),
      name: 'Chemistry',
      icon: 'flask',
      color: '#8b5cf6',
      classNum: 12,
      type: 'chemistry',
      chapters: [
        ch('Solutions & Colligative Properties', "Raoult's law, osmosis, depression of FP, elevation of BP", 'Physical'),
        ch('Electrochemistry', 'Cells, electrode potential, Nernst, electrolysis, Faraday', 'Physical'),
        ch('Chemical Kinetics', 'Rate laws, integrated rate eqs, Arrhenius, mechanisms', 'Physical'),
        ch('Surface Chemistry', 'Adsorption, colloids, emulsions, Freundlich & Langmuir isotherms', 'Physical'),
        ch('Solid State', 'Crystal types, packing, defects, electrical & magnetic properties', 'Physical'),
        ch('Haloalkanes & Haloarenes', 'SN1, SN2, E1, E2, reactivity, Grignard reagent prep', 'Organic'),
        ch('Alcohols, Phenols & Ethers', 'Prep, reactions, acidic character, distinction tests', 'Organic'),
        ch('Aldehydes, Ketones & Carboxylic Acids', 'Nucleophilic addition, aldol, Cannizzaro, oxidation', 'Organic'),
        ch('Amines & Diazonium Salts', 'Classification, prep, reactions, coupling, Sandmeyer', 'Organic'),
        ch('Polymers & Biomolecules', 'Addition/condensation polymers, carbohydrates, proteins, DNA', 'Organic'),
        ch('d & f Block Elements', 'Transition metals, variable valency, catalysis, lanthanides', 'Inorganic'),
        ch('Coordination Compounds', 'Werner, VBT, CFT, CFSE, isomerism, stability', 'Inorganic'),
        ch('p-Block Elements (15-18)', 'N, P, O, S, halogens, noble gases', 'Inorganic'),
        ch('Metallurgy & General Principles', 'Ore concentration, reduction, refining methods', 'Inorganic'),
      ],
    },
    // Class 12 Mathematics
    {
      id: uid(),
      name: 'Mathematics',
      icon: 'sigma',
      color: '#22c55e',
      classNum: 12,
      type: 'normal',
      chapters: [
        ch('Relations & Functions (Advanced)', 'Composition, inverse, types deep dive'),
        ch('Inverse Trigonometric Functions', 'Domain, range, principal values, properties'),
        ch('Matrices', 'Types, operations, inverse, transpose, rank'),
        ch('Determinants', "Properties, cofactors, Cramer's rule, adjoint"),
        ch('Continuity & Differentiability', 'Chain rule, implicit, logarithmic, parametric'),
        ch('Applications of Derivatives (AOD)', 'Tangents, normals, increasing/decreasing, maxima, minima'),
        ch('Indefinite Integration', 'Standard forms, substitution, by parts, partial fractions'),
        ch('Definite Integration', "Newton-Leibniz, properties, King's rule, Walli's"),
        ch('Area Under Curves', 'Area between curves, definite integral geometry'),
        ch('Differential Equations', 'Variable separable, homogeneous, linear, Bernoulli'),
        ch('Vector Algebra', 'Dot product, cross product, scalar/vector triple product'),
        ch('3D Geometry', 'Direction cosines, lines, planes, shortest distance'),
        ch('Linear Programming', 'LPP formulation, graphical method, corner points'),
        ch('Probability', "Conditional, Bayes' theorem, Bernoulli trials, distributions"),
      ],
    },
  ];
}
