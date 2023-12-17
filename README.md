<img width="1708" alt="infographic" src="https://github.com/ImmersiveMediaLaboratory/ColorTransferLab/assets/15614886/2d8c5d04-0db2-4352-bb48-e29173f8ec15">

# ColorTransferLab
![python3.10.12](https://img.shields.io/badge/build-3.10.12-blue?logo=python&label=Python) ![](https://img.shields.io/badge/build-22.04.3%20LTS-orange?logo=ubuntu&label=Ubuntu
) ![](https://img.shields.io/badge/build-MIT-purple?label=License) ![](https://img.shields.io/badge/build-6.4.0-brown?logo=octave&label=Octave) ![](https://img.shields.io/badge/build-GeForce%20RTX%203060-white?logo=nvidia&label=GPU) ![](https://img.shields.io/badge/build-intel%20Core%20i7--13700KF-white?logo=intel&label=CPU) ![](https://img.shields.io/badge/npm-8.9.0-red?logo=npm) ![](https://img.shields.io/badge/Node.js-16.15.0-green?logo=node.js)

ColorTransferLab is web-based user interface for the application and the evaluation of color transfer algorithms. It is based on a two server architecture as described in the chapter **1. System Architecture**. This tool uses the python library [ColorTransferLib](https://github.com/ImmersiveMediaLaboratory/ColorTransferLib) which contains availabe color transfer and image quality assessment metrics. This tool not only allows the application of color transfer on images, but also on 3D objects (see chapter XX. Datatypes).

## 1. System Architecture
...
![SystemArchitecture](https://github.com/ImmersiveMediaLaboratory/ColorTransferLab/assets/15614886/1a47b46d-f097-4151-a4ef-62c7f8533938)



## 2. Initialization
This tool offers three ways of running the algorithms via the web interface. 
- Using the provided [frontend](https://potechius.com/ColorTransferLab) and running your own **Server Instance 2**
- Hosting the whole system locally by yourself with remote access
- Hosting the whole system locally by yourself without remote access

<details>
<summary>1) Hosting the whole system locally by yourself with remote access</summary>
<br>

### **General Preparation**:
Run the following commands within the folder `<project_root>`.

1. Download the repository:
```
git clone git@github.com:ImmersiveMediaLaboratory/ColorTransferLab.git
```

2. Create and activate environment:
```
python3 -m venv ressources/env
source ressources/env/bin/activate
```

3. Install requirements:
```
pip install -U -r ressources/requirements/requirements.txt
```

4. Modify server information:<br>
Open the file `<project_root>/ressources/settings/settings.json` and modify the entries of **Server Instance 1 & 2** based on your system. It is necessary to set the **protocol** of both instances to `https`. The **wan** entries are a registered domain which will be used to access the web app via `https://<SI1[wan]>:<SI1[port]>/ColorTransferLab`. The application via **Server Instance 1** will be available via **SI1[port]** and the **Server Instance 2** via **SI12[port]**. **Port Forwarding** has to be enabled in your router settings. The **SI2[visibility]** entry has currently no purpose. The **SI2[name]** entry will be visible in the user interface as an available **Server Instance 2**. The **SIX[lan]** entries are the local address of your system.
```
{
	"SI1" : {
		"protocol": "https",
        "lan": "192.168.178.182",
        "wan": "potechius.com",
		"port": 9000
	},
	"SI2" : {
		"name": "GPU Server",
		"protocol": "https",
        "lan": "192.168.178.182",
        "wan": "potechius.com",
		"port": 9001,
		"visibility": "private"
	}
}
```
The **SI1** entries have to be additionally set in `<project_root>/instances/client/src/pages/SideBarLeft/Server.js`. Change the variable `export let SE1` to `<SI1[protocol]>://<SI1[wan]>:<SI1[port]>`.

5. SSL certificates:
In order to run the tool via HTTPS, SSL certificates are necessary. Three files have to be generated via e.g. (ZeroSSL)[https://zerossl.com/] and placed in `<project_root>/ressources/security`. (1) **ca_bundle.crt** containing the root and intermediate certificates, (2) **certificate.crt** containing the SSL certificate and (3) **private.key** containing the private key.


### **Server Instance 1**:
This step is only necessary when you want to host the whole system by yourself. Run the following commands within the folder `<project_root>/instances/client`.
1. Install NodeJS Packages:
```
npm install
```

2. Compiles the React project into HTML/CSS/JS files:
```
npm run build
```

3. Move build to Server Instance 1:
The generated build files in `<project_root>/instances/client/build` have to be copied to `<project_root>/instances/server_1` to make the web interface available.
```
cp -a build/. ../server_1/ColorTransferLab
```

4. Run Server Instance 1:
```
cd ../server_1
python main.py
```


### **Server Instance 2**:
Run the following commands within the folder `<project_root>/instances/server_2`.
1. Download the [`Models.zip`](https://potechius.com/Downloads/Models.zip) file, unpack it and place the `Models` folder at `<project_root>/server/Models`. This folder contains weights for algorithms based on neural networks.
```
wget https://potechius.com/Downloads/Models.zip
unzip Models.zip
rm Models.zip
```

2. Download datasets and previews:
...


3. Run Server Instance 2:
```
python main.py
```

</details>

## 2. Datatypes

TODO

## 3. Interface

### Algorithms-Sidebar
<table>
  <tr>
    <td width="25%"><b>Color Transfer</b></td>
    <td>This tab provides a collection of 12 color transfer algorithms for images and 3D point clouds. A list of available algorithms can be find in the <a href="https://github.com/ImmersiveMediaLaboratory/ColorTransferLib">ColorTransferLib</a>.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Classification (not available yet)}}}$</td>
    <td>This tab will provide a collection of classification algorithms for images, 3D point clouds and 3D meshes.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Reconstruction (not available yet)}}}$</td>
    <td>This tab will provide a collection of reconstruction algorithms for images in order to generate 3D point clouds.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Registration (not available yet)}}}$</td>
    <td>This tab will provide a collection of 3D point cloud registration algorithms.</td>
  </tr>
</table>

### Renderer-Area
<table>
  <tr>
    <td width="25%"><b>Source</b></td>
    <td>This area can visualize images and 3D point clouds by dragging it from the Items-Menu and dropping it to this area. The object within this area will be used as *Source*-Input for the color transfer.</td>
  </tr>
  <tr>
    <td width="25%"><b>Reference</b></td>
    <td>...</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Single Input</b></td>
    <td>This area can visualize images and 3D point clouds by dragging it from the Items-Menu and dropping it to this area. The object within this area will be used as *Reference*-Input for the color transfer.</td>
  </tr>
  <tr>
    <td width="25%" align="right">$\textcolor{red}{\textrm{\textbf{Multi Input}}}$</td>
    <td>This area allows the user to set multiple reference images.</td>
  </tr>
  <tr>
    <td width="25%" align="right">$\textcolor{red}{\textrm{\textbf{Color Theme}}}$</td>
    <td>This area allows the user to select multiple colors which will be used as reference.</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Comparison</b></td>
    <td>This area can visualize images and 3D point clouds by dragging it from the Items-Menu and dropping it to this area. The object within this area will be used as *Comparison*-Input for the color transfer. See `Buttons/Compare`-Section for more information.</td>
  </tr>
  <tr>
    <td width="25%"><b>Output</b></td>
    <td>his area can visualize images and 3D point clouds applying a color transfer algorithm. Only the results can be visualized here. See `Buttons/Start`-Section for more information.</td>
  </tr>
</table>

### Data-Sidebar
<table>
  <tr>
    <td width="25%"><b>Database</b></td>
    <td>...</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Output</b></td>
    <td>Contains the results which are created by the user.</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Published Examples</b></td>
    <td>Images, i.e., source, references and outputs from published color transfer algorithms were extracted and are available here.</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Meshes</b></td>
    <td>Will contain a variety of triangulated and textured meshes.</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>Uploads</b></td>
    <td>Images or point clouds which are uploaded, will be available here. See `Buttons/Upload`-Section for more information.</td>
  </tr>
  <tr>
    <td width="25%" align="right"><b>PointClouds</b></td>
    <td>Contains a variety of 3D point clouds for testing. Point clouds of seperate objects and of indoor scenes are available.</td>
  </tr>
  <tr>
    <td width="25%"><b>Items</b></td>
    <td>Shows the folders and objects which are contained within the corresponding Database-Folder.</td>
  </tr>
  <tr>
    <td width="25%">$\textcolor{red}{\textrm{\textbf{Objects}}}$</td>
    <td>This area will contain the seperate object within one selected and segemented object.</td>
  </tr>
</table>

### Console-Area
1. **Console**  
   ![console](https://user-images.githubusercontent.com/15614886/192982467-3f2b23e3-e88f-475e-a507-a71c999b263c.png)
2. **Evaluation**  
   TODO
3. **Configuration**  
   ![configuration](https://user-images.githubusercontent.com/15614886/192982722-1f3b7d61-c5f3-457d-a27d-8cf40f481b4c.png)
4. **Color Statistics**  
   ![colorstatistics](https://user-images.githubusercontent.com/15614886/192982998-dba4b666-59ba-4fe8-979b-39794ae8f1b5.png)
5. **Information**  
   ![information](https://user-images.githubusercontent.com/15614886/193003445-86d08284-4923-43fd-9e54-5d9bc6546525.png)

<table>
  <tr>
    <td width="25%"><b>Console</b></td>
    <td>Shows information about the current state of the application with corresponding time stamps.</td>
  </tr>
  <tr>
    <td><b>Evaluation</b></td>
    <td>Provides the user with information about objective evaluation metrics after clicking the *Compare*-button. See `Buttons/Compare`-Section for more information.</td>
  </tr>
  <tr>
    <td><b>Configuration</b></td>
    <td>Configurable parameters will be shown after clicking a chosen color transfer algorithm</td>
  </tr>
  <tr>
    <td><b>Color Statistics</b></td>
    <td>Shows the 2D color histograms for source, reference and output with the respective means and standard deviations.</td>
  </tr>
  <tr>
    <td><b>Information</b></td>
    <td>This area shows general information of the clicked color transfer algorithms.</td>
  </tr>
</table>

### Buttons
<table width="100%" leftmargin=0 rightmargin=0>
  <tr>
    <td width="25%"><b>Compare</b></td>
    <td>By clicking on this button objective evaluation metrics will be applied on the object in the `Comparison`-Area and the `Output`-Area. This only works if an output was generated and a comparison object was selected.</td>
  </tr>
  <tr>
    <td><b>Upload</b></td>
    <td>By clicking on this button the user can select an image or a point cloud which will be uploaded to the database. The uploaded object will be availabe in the `Items`-Area after clicking the `Uploads`-Button in the `Database`-Area.</td>
  </tr>
  <tr>
    <td><b>Start</b></td>
    <td>By clicking on this button the user starts the color transfer process. The resulting object will be displayed in the `Output`-Renderer. This only works if both a source and a reference object are selected and a color transfer algorithm was chosen.</td>
  </tr>
</table>

### Settings
<table>
  <tr>
    <td width="25%"><b>Grid</b></td>
    <td>Enables/Disables the grid on the XZ-plane in the 3D view of all renderers.</td>
  </tr>
  <tr>
    <td width="25%"><b>Point size</b></td>
    <td>Increases/Decreases the size of the vertices in the 3D view of all renderers.</td>
  </tr>
  <tr>
    <td width="25%"><b>Vertex normal color</b></td>
    <td>Replaces the vertex colors by the vertex normal values.</td>
  </tr>
  <tr>
    <td width="25%"><b>Axes</b></td>
    <td>Enables/Disables the axes in the 3D view of all renderers.</td>
  </tr>
  <tr>
    <td width="25%"><b>Color Space</b></td>
    <td>Enables/Disables the visualization of the color distribution for images and 3D point clouds.</td>
  </tr>
</table>

--- 

## Citation
If you utilize this code in your research, kindly provide a citation:
```
@inproceeding{potechius2023,
  title={A software test bed for sharing and evaluating color transfer algorithms for images and 3D objects},
  author={Herbert Potechius, Thomas Sikora, Gunasekaran Raja, Sebastian Knorr},
  year={2023},
  booktitle={European Conference on Visual Media Production (CVMP)},
  doi={10.1145/3626495.3626509}
}
```
