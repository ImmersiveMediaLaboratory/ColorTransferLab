/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import * as THREE from 'three'


/*************************************************************************************************************
* - creates three colored axes for visualizing the coordinatesystem's axes
* - the axes are shifted a little in y direction to prevent overlapping with the grid
*************************************************************************************************************/
const Axis = () => {
    const pointsRed = []
    pointsRed.push(new THREE.Vector3(0, 0.001, 0))
    pointsRed.push(new THREE.Vector3(5, 0.001, 0))
    const lineGeometryRed = new THREE.BufferGeometry().setFromPoints(pointsRed)

    const pointsGreen = []
    pointsGreen.push(new THREE.Vector3(0, 0.001, 0))
    pointsGreen.push(new THREE.Vector3(0, 5.001, 0))
    const lineGeometryGreen = new THREE.BufferGeometry().setFromPoints(pointsGreen)

    const pointsBlue = []
    pointsBlue.push(new THREE.Vector3(0, 0.001, 0))
    pointsBlue.push(new THREE.Vector3(0, 0.001, 5))
    const lineGeometryBlue = new THREE.BufferGeometry().setFromPoints(pointsBlue)
  
    return (
      <>
          <line geometry={lineGeometryGreen}>
            <lineBasicMaterial attach="material" color={'#00FF00'} linewidth={1} linecap={'round'} linejoin={'round'} />
          </line>
          <line geometry={lineGeometryRed}>
            <lineBasicMaterial attach="material" color={'#FF0000'} linewidth={1} linecap={'round'} linejoin={'round'} />
          </line>
          <line geometry={lineGeometryBlue}>
            <lineBasicMaterial attach="material" color={'#0000FF'} linewidth={1} linecap={'round'} linejoin={'round'} />
          </line>

      </>
    )
  }

export default Axis;