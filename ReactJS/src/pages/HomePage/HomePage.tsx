import React, { useState } from 'react';
import Topbar from '../../components/Topbar/Topbar';
import ProblemTable from '../../components/ProblemTable/ProblemTable';
import { Button, Tag, TagCloseButton, TagLabel, useDisclosure, Wrap } from '@chakra-ui/react';
import DeleteProblemModal from '../../components/Modals/DeleteProblemModal';
import UpdateProblemModal from '../../components/Modals/UpdateProblemModal';
import FilterModal from '../../components/Modals/FilterModal';

type HomePageProps = {
  user: any;
};

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  if (user && user.banned) {
    return (
      <>
        <main className="min-h-screen">
          <Topbar user={user} />
          <h1
            className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
          uppercase mt-10 mb-5'
          >
            Your account is banned
          </h1>
        </main>
      </>
    )
  }
  const [loadingProblems, setLoadingProblems] = useState(true);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  console.log(selectedCategories);

  const handleDeleteClick = (problem: any) => {
    setSelectedProblem(problem);
    onDeleteOpen();
  };
  const handleUpdateClick = (problem: any) => {
    setSelectedProblem(problem);
    onUpdateOpen();
  };
  const handleModalClose = () => {
    setSelectedProblem(null);
    onDeleteClose();
    onUpdateClose();
  };

  const handleFilterApply = async (categories: string[]) => {
    setSelectedCategories(categories);

  };

  const handleRemoveCategory = (category: string) => {
    const newSelectedCategories = selectedCategories.filter(c => c !== category);
    handleFilterApply(newSelectedCategories);
  };

  return (
    <>
      <main className="min-h-screen">
        <Topbar user={user} />
        <h1
          className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
          uppercase mt-10 mb-5'
        >
          PROBLEMS
        </h1>
        <div className="flex justify-center my-4"> {/* Canh giữa nút Filter */}
          <Button onClick={onFilterOpen}>Filter by category</Button>
        </div>
        <div className="flex justify-center my-4"> {/* Canh giữa nút Filter */}
        {selectedCategories.length > 0 && (
          <Wrap spacing={4} className="my-4 justify-center">
            {selectedCategories.map((category, index) => (
              <Tag key={index} size="lg" borderRadius="full" variant="solid" colorScheme="orange">
                <TagLabel>{category}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveCategory(category)} />
              </Tag>
            ))}
          </Wrap>
        )}
        </div>
        <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
          {loadingProblems && (
            <div className='max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse'>
              {[...Array(10)].map((_, idx) => (
                <LoadingSkeleton key={idx} />
              ))}
            </div>
          )}
          <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
            {!loadingProblems && (
              <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b '>
                <tr>
                  <th scope='col' className='px-1 py-3 w-0 font-medium'>
                    Status
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Title
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Difficulty
                  </th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>
                    Category
                  </th>
                  {user && user.role === "admin" && (
                    <>
                      <th scope='col' className='px-1 py-3 w-0 font-medium'>
                        Submissions
                      </th>
                      <th scope='col' className='px-1 py-3 w-0 font-medium'>
                        Update or delete problem
                      </th>
                    </>
                  )}
                </tr>
              </thead>
            )}
            <ProblemTable
              setLoadingProblems={setLoadingProblems}
              user={user} onDeleteClick={handleDeleteClick}
              onUpdateClick={handleUpdateClick}
              selectedCategories={selectedCategories}
            />
          </table>
        </div>
      </main>
      {selectedProblem && (
        <>
          <DeleteProblemModal
            isDeleteOpen={isDeleteOpen}
            onDeleteClose={handleModalClose}
            problem={selectedProblem}
          />
          <UpdateProblemModal
            isUpdateOpen={isUpdateOpen}
            onUpdateClose={handleModalClose}
            problem={selectedProblem}
          />
        </>
      )}
      <FilterModal isOpen={isFilterOpen} onClose={onFilterClose} onApply={handleFilterApply} />
    </>
  );
};
export default HomePage;

const LoadingSkeleton = () => {
  return (
    <div className='flex items-center space-x-12 mt-4 px-6'>
      <div className='w-6 h-6 shrink-0 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
};
