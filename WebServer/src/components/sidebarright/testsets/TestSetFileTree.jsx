/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestSetFileTree.scss";
import TestSetFileNode from "./TestSetFileNode"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Visualizes the file and folder structure of the requested database.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestSetFileTree({ data }) {
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function removeTmpFolders(data) {
        return data.map(node => {
            if (node.folders) {
                // Recursive call to also process deeper levels
                node.folders = removeTmpFolders(node.folders).filter(folder => folder.name !== 'tmp');
            }
            return node;
        }).filter(node => node.name !== 'tmp');
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const FileTreeContent = ({ data }) => {
        const isHiddenName = (name) => name && name.startsWith(".");

        if (!data) return null;

        // removes all tmp folders from the file tree
        data = removeTmpFolders(data)

        if (Array.isArray(data)) {
            if (data.length === 0) return null;
            if (data.length === 1 && data[0]?.folders) {
                const roots = (data[0].folders || []).filter(
                    (root) => !isHiddenName(root.name)
                );
                return (
                    <div className="file-tree">
                        {roots.map((root, idx) => (
                            <TestSetFileNode key={idx} node={root}/>
                        ))}
                    </div>
                );
            }
            return (
                <div className="file-tree">
                    {data.map((node, idx) =>
                        node && node.name ? (
                                <TestSetFileNode key={idx} node={node}/>
                        ) : null
                    )}
                </div>
            );
        }

        // Wenn data ein einzelner Knoten ist
        if (typeof data === "object" && data !== null && data.name) {
            return (
                <div className="file-tree">
                    <TestSetFileNode node={data} />
                </div>
            );
        }

        return null;
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="database_content">
            <FileTreeContent data={data} />
        </div>
    );
};