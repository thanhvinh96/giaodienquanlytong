import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { Modal, Button, Checkbox, TextInput, Select } from '@mantine/core'; // Import TextInput and Select from Mantine
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface Org {
  nameorg: string;
  nameadmin: string;
  emailadmin: string;
  addressadmin: string;
  phoneadmin: string;
  statusOrg: string;
  timestamp: string;
  tokeorg: string;
  businessBase64: string;
  historyOrg: any[];
  hospitalbranch: any[];
  users: User[];
}

interface User {
  fullname: string;
  address: string;
  phone: string;
  typeusers: string;
  cccd: string;
}

export default function HospitalManagent() {
  const [datatable, setdatatable] = useState<Org[]>([]);
  const [recordsData, setRecordsData] = useState<Org[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  // New state for filtering
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Filter for status (approved/pending)

  const dispatch = useDispatch();

  const handleApproveClick = async (org: Org) => {
    console.log('Organization approved:', org.nameorg, org.tokeorg);
    try {
      const response = await fetch('http://103.179.185.78:3002/creater-org-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: org.nameorg,
          tokeorg: org.tokeorg,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log('Response from server:', result);
    } catch (error) {
      console.error('Có lỗi xảy ra khi tạo tổ chức:', error);
    }
  };
  
  const showdata = async () => {
    try {
      const response = await fetch('http://103.179.185.78:3002/show-all-org');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const filteredData: Org[] = data.org.filter((org:any) => org.statusOrg === 'true');
      setdatatable(filteredData);
      filterData(filteredData); // Apply filter to data after fetching
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy dữ liệu:', error);
    }
  };

  // Filter the data based on search input and status
  const filterData = (data: Org[]) => {
    let filteredData = data;
    
    // Filter by organization name
    if (searchName) {
      filteredData = filteredData.filter((org) =>
        org.nameorg.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      filteredData = filteredData.filter((org) => org.statusOrg === statusFilter);
    }

    setRecordsData(filteredData.slice(0, pageSize));
  };

  useEffect(() => {
    dispatch(setPageTitle('Basic Table'));
  }, [dispatch]);

  useEffect(() => {
    showdata();
  }, []);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(datatable.slice(from, to));
  }, [page, pageSize, datatable]);

  // Update filter whenever searchName or statusFilter changes
  useEffect(() => {
    filterData(datatable);
  }, [searchName, statusFilter]);

  const handleDetailClick = (org: Org) => {
    setSelectedOrg(org);
    setModalOpen(true);
  };

  const handleSelectChange = (orgId: string) => {
    if (selectedOrgs.includes(orgId)) {
      setSelectedOrgs(selectedOrgs.filter((id) => id !== orgId));
    } else {
      setSelectedOrgs([...selectedOrgs, orgId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrgs.length === recordsData.length) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(recordsData.map((org) => org.tokeorg));
    }
  };

  return (
    <div>
      {/* Filters */}


      <div className="panel mt-6">
        <h5 className="font-semibold text-lg dark:text-white-light mb-5">Quản lý bệnh viện</h5>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <TextInput
          placeholder="Tìm kiếm theo tên bệnh viện"
          value={searchName}
          onChange={(event) => setSearchName(event.currentTarget.value)}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value || '')}
          data={[
            { value: 'true', label: 'Approved' },
            { value: 'false', label: 'Pending' },
          ]}
        />
      </div>
        <div className="datatables">
          <DataTable
            noRecordsText="Không có kết quả phù hợp với yêu cầu tìm kiếm"
            highlightOnHover
            className="whitespace-nowrap table-hover"
            records={recordsData}
            columns={[
              {
                accessor: 'select',
                title: <Checkbox onChange={handleSelectAll} checked={selectedOrgs.length === recordsData.length} />,
                render: (record) => (
                  <Checkbox
                    checked={selectedOrgs.includes(record.tokeorg)}
                    onChange={() => handleSelectChange(record.tokeorg)}
                  />
                ),
              },
              { accessor: 'nameorg', title: 'Tên bệnh viện' },
              { accessor: 'statusOrg', title: 'Trạng thái' },
              {
                accessor: 'Detail',
                title: 'Chi tiết',
                render: (record) => (
                  <Button onClick={() => handleDetailClick(record)}>Xem chi tiết</Button>
                ),
              },
              {
                accessor: 'Approve',
                title: 'Chấp thuận',
                render: (record) => (
                  <Button color="green" onClick={() => handleApproveClick(record)}>
                    Chấp thuận
                  </Button>
                ),
              },
            ]}
            totalRecords={datatable.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
          />
        </div>
      </div>

      {/* Modal for viewing organization details */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Organization Details">
        {selectedOrg && (
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <Zoom>
                <img
                  src={`${selectedOrg.businessBase64}`}
                  alt="Organization logo"
                  style={{ width: '150px', height: '150px', borderRadius: '50%', cursor: 'pointer' }}
                />
              </Zoom>
            </div>
            <div>
              <label>
                <strong>Tên bệnh viện:</strong>
              </label>
              <input type="text" value={selectedOrg.nameorg} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Admin Name:</strong>
              </label>
              <input type="text" value={selectedOrg.nameadmin} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Email Admin:</strong>
              </label>
              <input type="email" value={selectedOrg.emailadmin} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Address Admin:</strong>
              </label>
              <input type="text" value={selectedOrg.addressadmin} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Phone Admin:</strong>
              </label>
              <input type="tel" value={selectedOrg.phoneadmin} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Status:</strong>
              </label>
              <input type="text" value={selectedOrg.statusOrg} readOnly className="form-input" />
            </div>
            <div>
              <label>
                <strong>Timestamp:</strong>
              </label>
              <input type="text" value={selectedOrg.timestamp} readOnly className="form-input" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
