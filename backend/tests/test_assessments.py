import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_current_user, verify_supabase_token

class AssessmentApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.mock_user = {
            "id": "test-user-uuid-1234",
            "email": "owner@r3vive.io",
            "user_metadata": {"full_name": "Test Owner"}
        }
        self.other_user = {
            "id": "other-user-uuid-5678",
            "email": "intruder@r3vive.io",
            "user_metadata": {"full_name": "Different User"}
        }
        self.sample_record = {
            "id": "assess-uuid-9999",
            "user_id": "test-user-uuid-1234",
            "item_name": "Sony WH-1000XM4",
            "category": "electronics",
            "custom_category": None,
            "brand_model": "Sony XM4",
            "age": "1_to_3_years",
            "condition": "partially_functional",
            "reported_fault": "Right ear cup has buzzing sound",
            "repair_cost": 1500,
            "repair_cost_unknown": False,
            "replacement_cost": 20000,
            "replacement_cost_unknown": False,
            "expected_lifespan_years": 4,
            "expected_lifespan_unknown": False,
            "budget_constraint": "moderate",
            "urgency": "moderate",
            "primary_priority": "save_money",
            "adaptive_answers": {"electronics_q1": "buzzing"},
            "current_step": 3,
            "is_completed": False,
            "recommended_outcome": "repair",
            "selected_outcome": "repair",
            "selected_branch_id": "branch_elec_rep_1",
            "created_at": "2026-10-24T10:00:00Z",
            "updated_at": "2026-10-24T10:30:00Z"
        }

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_unauthenticated_requests_are_rejected(self):
        res = self.client.get("/api/assessments")
        self.assertEqual(res.status_code, 401)

        res = self.client.post("/api/assessments", json={"item_name": "Test"})
        self.assertEqual(res.status_code, 401)

    def test_create_assessment_authenticated(self):
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        payload = {
            "item_name": "Sony WH-1000XM4",
            "category": "electronics",
            "condition": "partially_functional",
            "reported_fault": "Right ear cup buzzing",
            "repair_cost": 1500,
            "repair_cost_unknown": False,
            "replacement_cost": 20000,
            "replacement_cost_unknown": False,
            "adaptive_answers": {"q1": "val1"},
            "current_step": 2,
            "is_completed": False
        }

        mock_resp = MagicMock()
        mock_resp.status_code = 201
        mock_resp.json.return_value = [self.sample_record]

        with patch("httpx.AsyncClient.post", return_value=mock_resp):
            res = self.client.post(
                "/api/assessments",
                json=payload,
                headers={"Authorization": "Bearer fake-token-123"}
            )
            self.assertEqual(res.status_code, 201)
            created = res.json()
            self.assertEqual(created["id"], "assess-uuid-9999")
            self.assertEqual(created["item_name"], "Sony WH-1000XM4")

    def test_get_assessment_by_owner_succeeds(self):
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [self.sample_record]

        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            res = self.client.get(
                "/api/assessments/assess-uuid-9999",
                headers={"Authorization": "Bearer owner-token"}
            )
            self.assertEqual(res.status_code, 200)
            item = res.json()
            self.assertEqual(item["id"], "assess-uuid-9999")
            self.assertEqual(item["user_id"], "test-user-uuid-1234")

    def test_get_assessment_by_another_user_is_rejected(self):
        """Verify strict ownership: another user cannot access this assessment (404/denied)."""
        app.dependency_overrides[get_current_user] = lambda: self.other_user

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        # PostgREST query ?id=eq...&user_id=eq.other-user-uuid-5678 returns empty list
        mock_resp.json.return_value = []

        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            res = self.client.get(
                "/api/assessments/assess-uuid-9999",
                headers={"Authorization": "Bearer intruder-token"}
            )
            self.assertEqual(res.status_code, 404)
            self.assertIn("not found or access denied", res.json()["detail"])

    def test_list_assessments_authenticated(self):
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [self.sample_record]

        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            res = self.client.get(
                "/api/assessments",
                headers={"Authorization": "Bearer fake-token-123"}
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("items", data)
            self.assertEqual(data["total"], 1)

    def test_update_assessment_preserves_id(self):
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        update_payload = {
            "item_name": "Sony WH-1000XM4 (Updated)",
            "current_step": 5,
            "is_completed": True,
            "selected_outcome": "repair"
        }

        updated_record = {**self.sample_record, **update_payload}

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [updated_record]

        with patch("httpx.AsyncClient.patch", return_value=mock_resp):
            res = self.client.put(
                "/api/assessments/assess-uuid-9999",
                json=update_payload,
                headers={"Authorization": "Bearer fake-token-123"}
            )
            self.assertEqual(res.status_code, 200)
            updated = res.json()
            self.assertEqual(updated["id"], "assess-uuid-9999")
            self.assertEqual(updated["item_name"], "Sony WH-1000XM4 (Updated)")

    def test_checklist_progress_persists_and_restores(self):
        """Verify that checklist progress is correctly passed, persisted, and restored."""
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        checklist_data = {
            "branch_diy_modular": {"0": True, "1": True, "2": False},
            "branch_pro_overhaul": {"0": False}
        }

        record_with_checklist = {
            **self.sample_record,
            "checklist_progress": checklist_data,
            "adaptive_answers": {
                **self.sample_record["adaptive_answers"],
                "_checklist_progress": checklist_data
            }
        }

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [record_with_checklist]

        with patch("httpx.AsyncClient.patch", return_value=mock_resp):
            res = self.client.put(
                "/api/assessments/assess-uuid-9999",
                json={"checklist_progress": checklist_data},
                headers={"Authorization": "Bearer fake-token-123"}
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("checklist_progress", data)
            self.assertEqual(data["checklist_progress"]["branch_diy_modular"]["0"], True)

    def test_delete_assessment(self):
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

        mock_resp = MagicMock()
        mock_resp.status_code = 204

        with patch("httpx.AsyncClient.delete", return_value=mock_resp):
            res = self.client.delete(
                "/api/assessments/assess-uuid-9999",
                headers={"Authorization": "Bearer fake-token-123"}
            )
            self.assertEqual(res.status_code, 204)

if __name__ == "__main__":
    unittest.main()
