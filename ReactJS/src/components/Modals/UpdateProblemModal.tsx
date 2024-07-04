import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
} from '@chakra-ui/react';
import { firestore } from '../../firebase/firebase';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { toast } from 'react-toastify';

type TestCase = {
    input: string;
    expectedOutput: string;
};

type Problem = {
    id: string;
    title: string;
    difficulty: string;
    categories: string[];
    description: string;
    testCases: TestCase[];
};

type UpdateProblemModalProps = {
    isUpdateOpen: boolean;
    onUpdateClose: () => void;
    problem: Problem | null;
};

const UpdateProblemModal: React.FC<UpdateProblemModalProps> = ({ isUpdateOpen, onUpdateClose, problem }) => {
    const [title, setTitle] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('Easy');
    const [categories, setCategories] = useState<string[]>(['']);
    const [description, setDescription] = useState<string>('');
    const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', expectedOutput: '' }]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (problem) {
            setTitle(problem.title);
            setDifficulty(problem.difficulty);
            setCategories(problem.categories);
            setDescription(problem.description);
            setTestCases(problem.testCases);
        }
    }, [problem]);

    const handleUpdateProblem = async () => {
        setIsLoading(true);
        
        // Kiểm tra xem có vấn đề để cập nhật không
        if (!problem) {
            toast.warn("No problem to update.", {
                position: "top-center",
                autoClose: 5000,
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
    
        // Kiểm tra các trường bắt buộc
        if (
            title.trim() === "" ||
            description.trim() === "" ||
            testCases.length === 0 ||
            testCases.some(testCase => testCase.input.trim() === "" || testCase.expectedOutput.trim() === "")
        ) {
            toast.warn("Please fill in all required field.", {
                position: "top-center",
                autoClose: 5000,
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
    
        try {
            // Kiểm tra sự tồn tại của tiêu đề trong cơ sở dữ liệu
            if (title !== problem.title) {
                const querySnapshot = await getDocs(query(collection(firestore, "problems"), where("title", "==", title)));
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
            }
    
            // Làm sạch dữ liệu trước khi cập nhật
            const cleanedTestCases = testCases.map(testCase => ({
                input: testCase.input.trim(),
                expectedOutput: testCase.expectedOutput.trim(),
            }));
    
            const updatedProblem = {
                title: title.trim(),
                difficulty,
                categories: categories.map(category => category.trim()).filter(category => category !== ""),
                description: description.trim(),
                testCases: cleanedTestCases,
            };
    
            // Thực hiện cập nhật vào cơ sở dữ liệu
            await updateDoc(doc(firestore, 'problems', problem.id), updatedProblem);
            toast.success(`Problem with ID: ${problem.id} updated successfully!`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
    
            onUpdateClose();
        } catch (error) {
            toast.error(`Error updating problem: ${error}`, {
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
            setIsLoading(false);
        }
    };
    

    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
        const updatedTestCases = [...testCases];
        updatedTestCases[index][field] = value;
        setTestCases(updatedTestCases);
    };

    const handleCategoryChange = (index: number, value: string) => {
        const updatedCategories = [...categories];
        updatedCategories[index] = value;
        setCategories(updatedCategories);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', expectedOutput: '' }]);
    };

    const removeTestCase = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const addCategory = () => {
        setCategories([...categories, '']);
    };

    const removeCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    return (
        <Modal size='xl' closeOnOverlayClick={false} isOpen={isUpdateOpen} onClose={onUpdateClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Update problem: {problem?.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl id="title" mb={4}>
                        <FormLabel>Title</FormLabel>
                        <Input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Enter the problem title" 
                        />
                    </FormControl>
                    <FormControl id="difficulty" mb={4}>
                        <FormLabel>Difficulty</FormLabel>
                        <Select 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </Select>
                    </FormControl>
                    <FormControl id="categories" mb={4}>
                        <FormLabel>Categories</FormLabel>
                        {categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <Input
                                    type="text"
                                    placeholder={`Category ${index+1} (not required)`}
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
                        <Textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Enter the problem description (required)" 
                        />
                    </FormControl>
                    <FormControl id="testCases" mb={4}>
                        <FormLabel>Test Cases</FormLabel>
                        {testCases.map((testCase, index) => (
                            <div key={index} className="flex flex-col gap-2 mb-2">
                                <Textarea
                                    placeholder={`Input ${index + 1} (required)`}
                                    value={testCase.input}
                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                    rows={3}
                                />
                                <Textarea
                                    placeholder={`Expected Output ${index + 1} (required)`}
                                    value={testCase.expectedOutput}
                                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                    rows={3}
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
                        onClick={handleUpdateProblem}
                        isLoading={isLoading}
                    >
                        Update
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateProblemModal;
