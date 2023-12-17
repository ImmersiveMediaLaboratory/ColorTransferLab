<img width="1708" alt="infographic" src="https://github.com/ImmersiveMediaLaboratory/ColorTransferLab/assets/15614886/2d8c5d04-0db2-4352-bb48-e29173f8ec15">

# ColorTransferLab

## 1. Datatypes

TODO

## 2. Initialization

Server:
1. Create and activate environment:
```
python3 -m venv env
source env/bin/activate
```

2. Install requirements:
```
pip install -U -r reauirements/requirements.txt
```

Client:
1. Install NodeJS Packages:
```
npm install
```

2. Start the test server:
```
npm start
```

## 3. Interface

### Algorithms-Sidebar
<table>
  <tr>
    <td width="25%"><b>Color Transfer</b></td>
    <td>This tab provides a collection of 12 color transfer algorithms for images and 3D point clouds. A list of available algorithms can be find in the <a href="https://github.com/hpotechius/ColorTransferLib">ColorTransferLib</a>.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Classification}}}$</td>
    <td>This tab will provide a collection of classification algorithms for images, 3D point clouds and 3D meshes.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Reconstruction}}}$</td>
    <td>This tab will provide a collection of reconstruction algorithms for images in order to generate 3D point clouds.</td>
  </tr>
  <tr>
    <td>$\textcolor{red}{\textrm{\textbf{Registration}}}$</td>
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
    <td width="25%" align="right">$\textcolor{red}{\textrm{\textbf{Meshes}}}$</td>
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

## 4. Info
- All red highlighted features are curently not supported.
- Output data and uploaded data are currently visible for all users.

## 5. Future extensions
:black_square_button: Loading and applying color transfer on triangulated meshes in ply/png or obj/mtl/png format and on videos.  
:black_square_button: Support for color transfer based on multi-references and color palettes.  
:black_square_button: Sementaic segmentation modules  
:black_square_button: Export of results and standardized comparison statistics.  
:black_square_button: More image examples from existing papers  
:black_square_button: Increased number of color transfer algorithms  
