import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    Textarea,
    Input,
    Select,
    ModalFooter,
    FormControl,
    FormLabel,
} from '@chakra-ui/react'
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { toast } from 'react-toastify';

interface TestCase {
    input: string;
    expectedOutput: string;
}

type AddProblemModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, onClose }) => {
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

            // Update categories collection
            const categoriesCollection = collection(firestore, "categories");

            for (const category of newProblem.categories) {
                const categoryDoc = doc(categoriesCollection, category);
                const categoryDocSnapshot = await getDoc(categoryDoc);

                if (categoryDocSnapshot.exists()) {
                    // Category exists, update the problemCount
                    const categoryData = categoryDocSnapshot.data();
                    const newProblemCount = (categoryData.problemCount || 0) + 1;

                    await updateDoc(categoryDoc, {
                        problemCount: newProblemCount,
                    });
                } else {
                    // Category does not exist, create a new one
                    await setDoc(categoryDoc, {
                        problemCount: 1,
                    });
                }
            }

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
                        <FormLabel>Test cases (First test case is sample test case)</FormLabel>
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
    )
}
export default AddProblemModal;