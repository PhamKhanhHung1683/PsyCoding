import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Checkbox,
    CheckboxGroup,
    Stack,
    Wrap,
    WrapItem,
    Badge,
} from '@chakra-ui/react';
import { firestore } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Category = {
    id: string; 
    problemCount: number;
};

type FilterModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onApply: (categories: string[]) => void;
};

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesCollection = collection(firestore, 'categories');
            const querySnapshot = await getDocs(categoriesCollection);
            const categoriesList: Category[] = [];

            querySnapshot.forEach((doc) => {
                const id = doc.id;
                const { problemCount } = doc.data(); 
                categoriesList.push({ id, problemCount });
            });

            setCategories(categoriesList);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleApply = () => {
        onApply(selectedCategories);
        onClose();
    };

    const handleCheckboxChange = (newCategories: string[]) => {
        setSelectedCategories(newCategories);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Filter by Category</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <CheckboxGroup value={selectedCategories} onChange={handleCheckboxChange}>
                        <Stack spacing={4}>
                            {categories.map((category, index) => (
                                <Checkbox key={index} value={category.id} colorScheme='orange'>
                                    {category.id} {category.problemCount > 0 && <Badge ml="1" colorScheme="orange">{category.problemCount}</Badge>}
                                </Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>
                </ModalBody>
                <ModalFooter>
                    <Wrap spacing={2} justify="center">
                        <WrapItem>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        </WrapItem>
                        <WrapItem>
                            <Button bg="black"
                                color="orange"
                                _hover={{ bg: "gray.700", color: "orange.300" }} onClick={handleApply}
                            >
                                Apply
                            </Button>
                        </WrapItem>
                    </Wrap>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default FilterModal;
