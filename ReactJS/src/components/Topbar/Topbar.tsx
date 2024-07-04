import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { Link } from 'react-router-dom';
import Logout from '../Buttons/Logout';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    Textarea,
    Input,
    Select,
    ModalFooter,
    FormControl,
    FormLabel,
} from '@chakra-ui/react'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { toast } from 'react-toastify';

interface TestCase {
    input: string;
    expectedOutput: string;
}

type TopbarProps = {
    user: any;
};

const Topbar: React.FC<TopbarProps> = ({ user }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const setAuthModalState = useSetRecoilState(authModalState);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [inputs, setInputs] = useState({
        title: "",
        difficulty: "Easy",
        categories: [""],
        description: "",
        testCases: [{ input: "", expectedOutput: "" }],
    });

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setInputs((prevState) => ({
            ...prevState,
            difficulty: value,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputs((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
        const newTestCases = [...inputs.testCases];
        newTestCases[index][field] = value;
        setInputs((prevState) => ({
            ...prevState,
            testCases: newTestCases,
        }));
    };

    const handleCategoryChange = (index: number, value: string) => {
        const newCategories = [...inputs.categories];
        newCategories[index] = value;
        setInputs((prevState) => ({
            ...prevState,
            categories: newCategories,
        }));
    };

    const addTestCase = () => {
        setInputs((prevState) => ({
            ...prevState,
            testCases: [...prevState.testCases, { input: "", expectedOutput: "" }],
        }));
    };

    const removeTestCase = (index: number) => {
        const newTestCases = inputs.testCases.filter((_, i) => i !== index);
        setInputs((prevState) => ({
            ...prevState,
            testCases: newTestCases,
        }));
    };

    const addCategory = () => {
        setInputs((prevState) => ({
            ...prevState,
            categories: [...prevState.categories, ""],
        }));
    };

    const removeCategory = (index: number) => {
        const newCategories = inputs.categories.filter((_, i) => i !== index);
        setInputs((prevState) => ({
            ...prevState,
            categories: newCategories,
        }));
    };

    const handleAddProblem = async () => {
        if (
            inputs.title.trim() === "" ||
            inputs.description.trim() === "" ||
            inputs.testCases.length === 0 ||
            inputs.testCases.some(testCase => testCase.input.trim() === "" || testCase.expectedOutput.trim() === "")
        ) {
            toast.warn("Please fill in all required fields", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }
        setIsLoading(true);
        const querySnapshot = await getDocs(query(collection(firestore, "problems"), where("title", "==", inputs.title)));
        if (!querySnapshot.empty) {
            toast.warn("Title already exists. Please use a different title.", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setIsLoading(false);
            return;
        }
        // Trim các giá trị input và expectedOutput trước khi lưu vào Firestore
        const cleanedTestCases = inputs.testCases.map(testCase => ({
            input: testCase.input.trim(),
            expectedOutput: testCase.expectedOutput.trim(),
        }));

        // Lưu trữ dữ liệu dưới dạng JSON đơn giản, không bao gồm tài liệu quá lớn
        const newProblem = {
            title: inputs.title.trim(),
            difficulty: inputs.difficulty,
            categories: inputs.categories.filter(category => category.trim() !== ""), // Lọc bỏ các category trống
            description: inputs.description.trim(),
            testCases: cleanedTestCases,
        };
        console.log("New Problem Data:", newProblem);
        try {
            const docRef = await addDoc(collection(firestore, "problems"), newProblem);
            const problemId = docRef.id;

            // Update the document with problemId
            await updateDoc(doc(firestore, "problems", docRef.id), {
                problemId: problemId,
            });
            toast.success("Save to database successfully!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            onClose();
        } catch (error: any) {
            toast.error(`Error add problem: ${error}`, {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            resetInputs();
            setIsLoading(false);
        }
    };

    const resetInputs = () => {
        setInputs({
            title: "",
            difficulty: "Easy",
            categories: [""],
            description: "",
            testCases: [{ input: "", expectedOutput: "" }],
        });
    };

    return (
        <nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
            <div className={`flex w-full items-center justify-between max-w-[1200px] mx-auto`}>
                <Link to='/' className='flex items-center justify-center h-20 text-brand-orange text-lg font-semibold'>
                    PsyCoding
                </Link>

                <div className='flex items-center space-x-4 flex-1 justify-end'>
                    {!user && (
                        <Link
                            to='/auth'
                            onClick={() => {
                                setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }));
                            }}
                        >
                            <button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
                        </Link>
                    )}
                    {user && user.role === "admin" && (
                        <>
                            <div className='bg-dark-fill-3 py-1.5 px-3 rounded text-brand-orange'
                            >
                                You are an admin
                            </div>
                            <Link className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ' to='/usersManagement'>
                                Manage users
                            </Link>
                            <button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ' onClick={onOpen}>
                                Add problem
                            </button>
                            <Modal size='xl' closeOnOverlayClick={false} isOpen={isOpen} onClose={() => { onClose(); resetInputs(); }}>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Add your problem</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl id="title" mb={4}>
                                            <FormLabel>Title</FormLabel>
                                            <Input onChange={handleInputChange} type='text' placeholder='Enter the problem title (required)' name='title' />
                                        </FormControl>
                                        <FormControl id="difficulty" mb={4}>
                                            <FormLabel>Difficulty</FormLabel>
                                            <Select onChange={handleDifficultyChange}>
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl id="categories" mb={4}>
                                            <FormLabel>Categories</FormLabel>
                                            {inputs.categories.map((category, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <Input
                                                        type="text"
                                                        placeholder={`Category ${index + 1} (not required)`}
                                                        value={category}
                                                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                                                    />
                                                    <Button type="button" onClick={() => removeCategory(index)}>Remove</Button>
                                                </div>
                                            ))}
                                            <Button type="button" onClick={addCategory}>Add Category</Button>
                                        </FormControl>
                                        <FormControl id="description" mb={4}>
                                            <FormLabel>Description</FormLabel>
                                            <Textarea onChange={handleInputChange} placeholder='Enter the problem description (required)' name='description' rows={10} />
                                        </FormControl>
                                        <FormControl id="testCases" mb={4}>
                                            <FormLabel>Test cases (We show the first 3 test cases as sample test cases)</FormLabel>
                                            {inputs.testCases.map((testCase, index) => (
                                                <div key={index} className="flex flex-col gap-2 mb-2">
                                                    <Textarea
                                                        placeholder={`Input ${index + 1} (Fill at least 1 test case)`}
                                                        value={testCase.input}
                                                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                        rows={5}
                                                    />
                                                    <Textarea
                                                        placeholder={`Expected output ${index + 1} (Fill at least 1 test case)`}
                                                        value={testCase.expectedOutput}
                                                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                                        rows={5}
                                                    />
                                                    <Button type="button" onClick={() => removeTestCase(index)}>Remove Test Case</Button>
                                                </div>
                                            ))}
                                            <Button type="button" onClick={addTestCase}>Add Test Case</Button>
                                        </FormControl>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button
                                            bg="black"
                                            color="orange"
                                            _hover={{ bg: "gray.700", color: "orange.300" }}
                                            onClick={handleAddProblem}
                                            isLoading={isLoading}
                                        >
                                            Save to database
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    )}
                    {user && (
                        <>
                            <div className='cursor-pointer group relative'>
                                <img src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
                                <div
                                    className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg 
                                    z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out'
                                >
                                    <p className='text-sm'>Your name: {user.displayName}</p>
                                    <p className='text-sm'>Your email: {user.email}</p>
                                </div>
                            </div>
                            <Logout />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
