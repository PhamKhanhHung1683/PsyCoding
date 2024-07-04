import React, { useState } from 'react';
import Split from 'react-split';
import ProblemDescription from './ProblemDescription/ProblemDescription';
import PlayGround from './PlayGround/PlayGround';

type WorkspaceProps = {
    problem: any;
    user: any;
};

const Workspace: React.FC<WorkspaceProps> = ({ problem, user }) => {
    const [solved, setSolved] = useState(false);
    return <Split className='split h-screen'>
        <ProblemDescription problem={problem} user={user} _solved={solved}/>
        <PlayGround problem={problem} user={user} setSolved={setSolved}/>
    </Split>
}
export default Workspace;