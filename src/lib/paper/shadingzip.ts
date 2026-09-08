export const selection = [
  {keyword:'Method',tex:String.raw`\operatorname{SELECT-REPRESENTATIVES}(\mathcal S_b,\mathcal E,r,F)`},
  {tex:String.raw`K_b\gets\min(|\mathcal S_b|,\max(1,\operatorname{round}(r|\mathcal S_b|)))`},
  {tex:String.raw`Y_{\mathcal E}\gets\operatorname{Raytrace}(\mathcal S_b,\mathcal E);\quad\{\mathbf f_i\}\gets\operatorname{Features}(\mathcal S_b,Y_{\mathcal E},F)`,comment:'Exploratory shading and features'},
  {tex:String.raw`\mathcal C\gets\operatorname{KMeans}(\{\mathbf f_i\},K_b);\quad\mathcal R_b\gets\varnothing`,comment:'Initialize representatives'},
  {keyword:'for each',tex:String.raw`\text{centroid }\mathbf c\in\mathcal C`},
  {depth:1,tex:String.raw`i\gets\text{sensor nearest to }\mathbf c`,comment:'Get the real sensor closest to the centroid'},
  {depth:1,keyword:'while',tex:String.raw`i\in\mathcal R_b`,comment:'Check if the sensor is already selected'},
  {depth:2,tex:String.raw`i\gets\text{next-nearest sensor}`,comment:'If selected, use the next-nearest'},
  {depth:1,tex:String.raw`\mathcal R_b\gets\mathcal R_b\cup\{i\}`,comment:'Update representative sensor set'},
  {keyword:'for each',tex:String.raw`i\in\mathcal S_b`},
  {depth:1,tex:String.raw`a(i)\gets\underset{j\in\mathcal R_b}{\arg\min}\,\|\mathbf f_i-\mathbf f_j\|_2`,comment:'Assign representative sensor'},
  {keyword:'return',tex:String.raw`\mathcal R_b,\,a,\,Y_{\mathcal E}`},
];
export const reconstruction = [
  {keyword:'for each',tex:String.raw`\text{building }b\in\mathcal B`,comment:'Streamed building access'},
  {depth:1,tex:String.raw`\mathcal R_b,a,Y_{\mathcal E}\gets\operatorname{SELECT-REPRESENTATIVES}(\mathcal S_b,\mathcal E,r,F)`,comment:'Run Algorithm 1',ref:'algorithm-1'},
  {depth:1,keyword:'if',tex:String.raw`\mathcal T\setminus\mathcal E\ne\varnothing`,comment:'Check for remaining periods'},
  {depth:2,tex:String.raw`Y_{\mathcal R}\gets\operatorname{Raytrace}(\mathcal R_b,\mathcal T\setminus\mathcal E)`,comment:'Trace only representative sensors'},
  {depth:1,keyword:'for each',tex:String.raw`i\in\mathcal S_b,\;t\in\mathcal T`,comment:'For each sensor and period'},
  {depth:2,keyword:'if',tex:String.raw`t\in\mathcal E,\quad\hat y_{i,t}\gets Y_{\mathcal E}[i,t]`,comment:'Retain the sensor’s calculated result'},
  {depth:2,keyword:'else',tex:String.raw`\hat y_{i,t}\gets Y_{\mathcal R}[a(i),t]`,comment:'Use the representative’s result'},
  {depth:1,tex:String.raw`\operatorname{Save}(b,\mathcal R_b,a,\hat Y_b);\quad\operatorname{Discard}(\hat Y_b);\quad\operatorname{AutoGC}()`,comment:'Save results and free memory'},
];
export const wmape = String.raw`\begin{aligned}\operatorname{WMAPE}&=\frac{\sum_{i\in\mathcal I}\sum_{t\in\mathcal T}\sum_{h\in\mathcal H}w_{i,t,h}\,|y_{i,t,h}-\hat y_{i,t,h}|}{\sum_{i\in\mathcal I}\sum_{t\in\mathcal T}\sum_{h\in\mathcal H}w_{i,t,h}\,y_{i,t,h}},\\[6pt]w_{i,t,h}&=A_i\,\pi_t\,(\sin\alpha_{t,h})_+\,(\mathbf n_i\cdot\mathbf s_{t,h})_+ .\end{aligned}`;
export const cases = [
  ['Financial District','40.71, −74.01','Urban, high-rise, street canyon',2245,225,227614],
  ['Midtown','40.75, −73.99','Urban, high-rise, grid',4578,300,265876],
  ['Red Hook','40.68, −74.00','Urban, industrial waterfront',6719,300,102846],
  ['Park Slope','40.67, −73.98','Urban, attached rowhouse',11157,300,68126],
  ['Riverdale','40.89, −73.91','Suburban, hilly, wooded',2036,204,81952],
  ['Co-op City','40.86, −73.83','Urban, towers, superblocks',3698,300,61399],
  ['Bayside','40.76, −73.77','Suburban, semi-detached',12993,300,41201],
  ['Jackson Heights','40.76, −73.88','Urban, perimeter blocks',17761,300,60092],
  ['Long Island City','40.75, −73.94','Urban, high-rise, industrial',3149,300,226362],
  ['Greenridge','40.55, −74.16','Suburban, residential',1613,162,21620],
];
