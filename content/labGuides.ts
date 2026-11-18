/**
 * "How to use this lab": short student instructions for every Explore tool in the Visual Calculus Lab,
 * so nobody opens a tool and wonders what to do. Each guide says
 *   - goal:  what the student should understand by the end,
 *   - steps: what to tap, move or choose (using the tool's own control names),
 *   - look:  what to watch for while doing it.
 * Written for the app (app guidance), never presented as UNAM material. Shown by ExploreScaffold above
 * the tool; `__tests__/lab-guides.test.ts` checks that every learner-visible lab has one.
 */

export interface LabGuide {
  goal: string;
  steps: string;
  look: string;
}

export const LAB_GUIDES: Readonly<Record<string, LabGuide>> = {
  // Topic 1: Integration
  'family-of-curves': {
    goal: 'See why an indefinite integral is a whole family $F(x) + C$, not one curve.',
    steps:
      'Move the Constant C slider, tap Add current curve to keep a copy, and repeat a few times. Turn on Show derivative.',
    look: 'Every curve is the same shape moved up or down, so all of them have the same slope at each $x$.',
  },
  'power-rule-machine': {
    goal: 'Use the power rule $\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C$ and know when it fails.',
    steps: 'Choose an exponent $n$, then tap Next step to run the machine one stage at a time (or Show all).',
    look: 'The exponent goes up by 1 and you divide by the new exponent. Try $n = -1$: dividing by $0$ is impossible, so $\\ln|x|$ is used.',
  },
  'substitution-highlighter': {
    goal: 'Recognise the inner function $u$ and its derivative $du$ inside an integral.',
    steps: 'Tap each part of the integral to see its role, then tap Choose u and pick $u$ and $du$.',
    look: 'With a good choice, every $x$ disappears and the integral becomes a simpler one in $u$.',
  },
  'transformation-lab': {
    goal: 'Follow a whole substitution from start to finish.',
    steps:
      'Tap Next to move through the stages (choose $u$, find $du$, rewrite, integrate, back to $x$). Use Back to compare and Hint if unsure.',
    look: 'How each stage changes the integral, and that the final answer is written in $x$ again.',
  },
  'fraction-decomposer': {
    goal: 'Build the right partial-fraction template for a rational function.',
    steps:
      'Factorise the denominator, choose the case for each factor, then tap Check classification and Check template.',
    look: 'Linear factors get a constant, irreducible quadratics get $Bx + C$, and a repeated factor gets one term per power.',
  },
  'trig-transformation-lab': {
    goal: 'Choose the substitution from Table 1.1 that removes a root or a trigonometric quotient.',
    steps: 'Browse the table, pick a substitution and step through the transformation with Next and Back.',
    look: 'The square root disappears (or the integrand becomes a rational function of $t$).',
  },
  'choose-u-lab': {
    goal: 'Choose $u$ and $dv$ well in integration by parts, $\\int u\\,dv = uv - \\int v\\,du$.',
    steps: 'For each integral, pick a choice of $u$ and $dv$, read the feedback, then try the other choice.',
    look: 'Whether the integral that is left is simpler, harder, or goes in a circle.',
  },
  'repeated-parts-flow': {
    goal: 'See integration by parts applied more than once.',
    steps: 'Choose an example and step through each application of the formula.',
    look: 'Each application lowers the power of $x$, until no product is left or the original integral returns.',
  },
  'pattern-explorer': {
    goal: 'Decide which strategy a trigonometric integral needs before calculating.',
    steps: 'Change the powers and frequencies, and switch between the patterns (for example $\\sin px\\cos qx$).',
    look: 'Odd powers: save one factor. Even powers: half-angle identities. Different frequencies: product to sum.',
  },
  'reduction-flow': {
    goal: 'See how a reduction formula lowers $I_n$ step by step.',
    steps: 'Choose a value of $n$ and follow the formula down until a standard integral is reached.',
    look: 'The power drops each time (by 1 or 2) until the integral can be done directly.',
  },

  // Topic 2: Integration as a process of finding the area under the graph
  'riemann-sum-explorer': {
    goal: 'Approximate the area under a curve with rectangles of width $\\Delta x = \\frac{b-a}{n}$.',
    steps:
      'Move the Number of rectangles n slider and change where each rectangle’s height is read (right, left, sample point, midpoint).',
    look: 'As $n$ grows, the total area of the rectangles gets closer to the area under the curve.',
  },
  'limit-of-riemann-sums': {
    goal: 'See the definite integral as the limit of Riemann sums.',
    steps: 'Increase the Number of rectangles n slider step by step.',
    look: 'The sum settles on one number: the value of the definite integral.',
  },
  'midpoint-rule-lab': {
    goal: 'Compare the Mid-point Rule with the endpoint rules for the same $n$.',
    steps: 'Change $n$ and switch between midpoints and endpoints.',
    look: 'Midpoint rectangles usually overshoot and undershoot in a way that cancels, so they are closer to the integral.',
  },
  'integral-properties-lab': {
    goal: 'Read the properties of the definite integral as statements about areas.',
    steps: 'Move the Split point c, reverse the limits, and compare two functions.',
    look: 'The two pieces always add up to the whole, reversing the limits changes the sign, and a larger function has a larger integral.',
  },
  'accumulation-lab': {
    goal: 'See the Second Fundamental Theorem: the accumulated area $g(x)$ changes at the rate $f(x)$.',
    steps: 'Move the Upper limit x slider from left to right.',
    look: '$g$ rises where $f > 0$, falls where $f < 0$, and has a horizontal tangent where $f = 0$.',
  },
  'mean-value-lab': {
    goal: 'Find the average value of $f$ on $[a, b]$ as a rectangle height.',
    steps: 'Move the Height of the rectangle slider until the rectangle’s area equals the area under the curve.',
    look: 'That height lies between the smallest and largest values of $f$, and the curve reaches it at some $c$.',
  },
  'infinite-interval-lab': {
    goal: 'Decide whether an area out to infinity is finite.',
    steps: 'Move the Upper limit t slider further and further to the right.',
    look: 'The area under $\\frac{1}{x^{2}}$ settles on a number (converges); the area under $\\frac{1}{x}$ keeps growing (diverges).',
  },
  'asymptote-lab': {
    goal: 'Decide whether the area next to a vertical asymptote is finite.',
    steps: 'Move the slider so $t$ gets closer and closer to the asymptote.',
    look: 'Whether the area settles on a number or grows without bound as $t$ approaches the asymptote.',
  },
  'comparison-lab': {
    goal: 'Use the Comparison Test to decide convergence without integrating.',
    steps: 'Choose a comparison function and move $t$ to the right.',
    look: 'A smaller function under a finite area is finite; a larger function over an infinite area is infinite.',
  },

  // Topic 3: Differential calculus in ℝⁿ
  'rn-domain-explorer': {
    goal: 'Find where a function of two variables is defined.',
    steps: 'Choose a function, then move the point with the x and y sliders, inside and outside the shaded region.',
    look: 'The shaded domain is exactly where the formula makes sense (no negative square roots, no division by zero, positive logarithms).',
  },
  'rn-slice-lab': {
    goal: 'Read a partial derivative as the slope of a slice of the surface.',
    steps:
      'Choose Hold y constant (for $f_x$) or Hold x constant (for $f_y$), then move the point with the a and b sliders.',
    look: 'The slice is an ordinary curve, and the partial derivative is the slope of its tangent line.',
  },
  'rn-one-variable-at-a-time': {
    goal: 'Find partial derivatives of a function of three variables.',
    steps: 'Choose which variable moves; set the other two with the sliders.',
    look: 'Only the moving variable changes the value, so the other two behave like constants.',
  },
  'rn-mixed-partials-lab': {
    goal: 'Compare the two mixed partial derivatives $f_{xy}$ and $f_{yx}$.',
    steps: 'Choose a function and a point, and make the step $h$ smaller.',
    look: 'Both orders approach the same number when the second partials are continuous (Clairaut’s Theorem).',
  },
  'rn-total-differential-lab': {
    goal: 'Build the total differential $dz = f_{x}\\,dx + f_{y}\\,dy$ term by term.',
    steps: 'Move the point and the dx and dy sliders.',
    look: 'Each term is a partial derivative times a small change, and their sum estimates the change in $z$.',
  },
  'rn-chain-tree-one': {
    goal: 'Use the tree diagram for the Chain Rule with one independent variable.',
    steps: 'Follow each path from $w$ down to $t$ and watch the products build up.',
    look: '$\\frac{dw}{dt}$ is the sum of one product for each path.',
  },
  'rn-chain-tree-two': {
    goal: 'Use the tree diagram for the Chain Rule with two independent variables.',
    steps: 'Choose Paths to s or Paths to t and follow every path down to it.',
    look: 'Only the paths that end at the chosen variable contribute to that partial derivative.',
  },
  'rn-coordinate-grid-lab': {
    goal: 'Find partial derivatives of an inverse change of variables from differentials.',
    steps: 'Choose an example and move the point on the new coordinate grid.',
    look: 'Solving the differentials for $dx$ and $dy$ gives the inverse partial derivatives at that point.',
  },
  'rn-polar-second-order-lab': {
    goal: 'Check the second-order Chain Rule in polar coordinates (Example 3.4.7).',
    steps: 'Choose a function and move the point $(r, \\theta)$.',
    look: 'The Cartesian and polar sides of the formula give the same number at every point.',
  },

  // Topic 4: Applications of the partial derivative
  'pda-gradient-probe': {
    goal: 'See the gradient $\\nabla f = f_{x}\\mathbf{i} + f_{y}\\mathbf{j}$ at a point.',
    steps: 'Move the Probe x and Probe y sliders across the contour map.',
    look: 'The gradient arrow points uphill, at right angles to the contour line, and is longer where the contours are closer.',
  },
  'pda-tangent-plane-lab': {
    goal: 'See the tangent plane and normal line to a surface $F(x, y, z) = 0$.',
    steps: 'Choose an example and move P with the x of P and y of P sliders; use Turn the view to look around.',
    look: 'The normal line follows $\\nabla F(P)$ and the tangent plane is perpendicular to it, just touching the surface at P.',
  },
  'pda-critical-point-finder': {
    goal: 'Locate critical points where $f_{x} = 0$ and $f_{y} = 0$.',
    steps:
      'Move the Probe x and Probe y sliders, or tap a listed critical point, and watch the curves $f_{x} = 0$ and $f_{y} = 0$.',
    look: 'Critical points are exactly where both curves meet (or where a partial derivative does not exist).',
  },
  'pda-saddle-or-not': {
    goal: 'Classify a critical point with $d = f_{xx}f_{yy} - [f_{xy}]^{2}$.',
    steps: 'Move the f_xx, f_yy and f_xy sliders.',
    look: '$d > 0$ with $f_{xx} > 0$: minimum; $d > 0$ with $f_{xx} < 0$: maximum; $d < 0$: saddle; $d = 0$: inconclusive.',
  },
};

export const labGuideFor = (activityId: string): LabGuide | undefined => LAB_GUIDES[activityId];
