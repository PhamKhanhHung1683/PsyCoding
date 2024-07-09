import React, { useEffect, useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { firestore } from '../../firebase/firebase';
import { Link } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
} from '@chakra-ui/react';

type ProblemTableProps = {
    selectedCategories: string[];
    setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
    user: any;
    onDeleteClick: (problem: any) => void;
    onUpdateClick: (problem: any) => void;
};

const ProblemTable: React.FC<ProblemTableProps> = ({ selectedCategories, setLoadingProblems, user, onDeleteClick, onUpdateClick }) => {
    const [problems, setProblems] = useState<any[]>([]);
    const solvedProblems = useGetSolvedProblems(user);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoadingProblems(true);
                let problemsRef = collection(firestore, 'problems');

                if (selectedCategories.length > 0) {
                    const finalQuery = query(problemsRef, where('categories', 'array-contains-any', selectedCategories));

                    const unsubscribe = onSnapshot(finalQuery, (querySnapshot) => {
                        const problemsData: any[] = [];
                        querySnapshot.forEach((doc) => {
                            problemsData.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        setProblems(problemsData);
                        setLoadingProblems(false);
                    }, (error) => {
                        console.error('Error fetching problems:', error);
                        setLoadingProblems(false);
                    });

                    return () => unsubscribe();
                } else {
                    const unsubscribe = onSnapshot(problemsRef, (querySnapshot) => {
                        const problemsData: any[] = [];
                        querySnapshot.forEach((doc) => {
                            problemsData.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        setProblems(problemsData);
                        setLoadingProblems(false);
                    }, (error) => {
                        console.error('Error fetching problems:', error);
                        setLoadingProblems(false);
                    });

                    return () => unsubscribe();
                }
            } catch (error) {
                console.error('Error fetching problems:', error);
                setLoadingProblems(false);
            }
        };

        fetchProblems();
    }, [selectedCategories, setLoadingProblems]);

    return (
        <>
            <tbody>
                {problems.map((problem) => {
                    const difficultyColor =
                        problem.difficulty === "Easy"
                            ? "text-dark-green-s"
                            : problem.difficulty === "Medium"
                                ? "text-dark-yellow"
                                : "text-dark-pink";
                    return (
                        <tr key={problem.id} className='border-b border-gray-400/50'>
                            <th className='px-2 py-4 font-medium whitespace-nowrap text-dark-green-s'>
                                {solvedProblems?.includes(problem.problemId) && <BsCheckCircle fontSize={"18"} width='18' />}
                            </th>
                            <td className='px-6 py-4 '>
                                <Link className='hover:text-blue-600 cursor-pointer' to={`/problems/${problem.id}`}>
                                    {problem.title}
                                </Link>
                            </td>
                            <td className={`px-6 py-4 ${difficultyColor}`}>{problem.difficulty}</td>
                            <td className='px-6 py-4'>
                                {problem.categories?.map((category: string, index: number) => (
                                    <p key={index}>{category}</p>
                                ))}
                            </td>
                            {user && user.role === "admin" && (
                                <>
                                    <td className='px-1 py-4'>
                                        <Link to={`problemSubmissions/${problem.id}`}>
                                            <Button>
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                    <td className='px-1 py-4'>
                                        <Menu>
                                            <MenuButton as={Button} >
                                                Actions
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem onClick={() => onUpdateClick(problem)}>Update</MenuItem>
                                                <MenuItem onClick={() => onDeleteClick(problem)}>Delete</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </td>
                                </>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </>
    );
};

export default ProblemTable;

function useGetSolvedProblems(user: any) {
    const [solvedProblems, setSolvedProblems] = useState<string[]>([]);

    useEffect(() => {
        const getSolvedProblems = async () => {
            if (user) {
                const userRef = doc(firestore, "users", user.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    setSolvedProblems(userDoc.data().solvedProblems);
                }
            } else {
                setSolvedProblems([]);
            }
        };

        getSolvedProblems();
    }, [user]);

    return solvedProblems;
}
