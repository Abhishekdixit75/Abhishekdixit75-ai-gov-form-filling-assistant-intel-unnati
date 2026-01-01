import json
import os

class EntityStore:
    """
    Merging logic for the Global Entity Store.
    Prioritizes entities with higher confidence scores.
    
    This class is instantiated PER SESSION. It holds the runtime state
    of extracted entities for a specific user flow.
    """
    def __init__(self):
        # The central in-memory store for the session
        # Format: "key": {"value": "...", "confidence": 0.95}
        self.store = {}
        self.global_schema = self._load_global_schema()

    def _load_global_schema(self):
        """Loads valid keys from global_schema.json"""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            schema_path = os.path.join(base_dir, "global_schema.json")
            if os.path.exists(schema_path):
                with open(schema_path, "r") as f:
                    data = json.load(f)
                    return data.get("entities", {})
        except Exception as e:
            print(f"Warning: Could not load global schema: {e}")
            return {}
        return {}

    def merge_entities(self, layer4_output: dict, source_type: str = "unknown"):
        """
        Merges a new batch of extracted entities into the store.
        Applies Trust Hierarchy and Field Policies.
        """
        if not layer4_output:
            return

        from form_mapper.merge_policies import get_source_score, FIELD_POLICIES
        from utils.normalizer import normalize_date
        from utils.validators import validate_entity_data


        new_source_score = get_source_score(source_type)

        for key, new_data in layer4_output.items():
            # 1. Skip if key is unknown
            if self.global_schema and key not in self.global_schema:
                pass

            # 2. Skip malformed
            if not isinstance(new_data, dict) or "value" not in new_data:
                continue

            new_val = new_data.get("value")
            
            # --- VALIDATION CHECK ---
            if key in ["aadhaar_number", "pan_number", "pincode", "ifsc_code"]:
                 if not validate_entity_data(key, str(new_val)):
                     print(f"Skipping Invalid Field: {key}={new_val}")
                     continue
            # ------------------------

            new_conf = new_data.get("confidence", 0.0)

            # 3. Skip null/empty
            if not new_val:
                continue
            
            # Normalization
            if key == "date_of_birth":
                new_val = normalize_date(new_val)



            # 4. Determine Policy
            policy = FIELD_POLICIES.get(key, "info_open")

            # 5. Check if Key Exists
            if key not in self.store:
                self._update_entry(key, new_val, new_conf, source_type)
            else:
                existing_entry = self.store[key]
                existing_source = existing_entry.get("source", "unknown")
                existing_score = get_source_score(existing_source)
                existing_conf = existing_entry.get("confidence", 0.0)
                existing_val = existing_entry.get("value", "")

                # --- Policy Logic ---
                
                # A. Trust Hierarchy (Primary Decision)
                if new_source_score > existing_score:
                    # Higher authority always wins (e.g. Aadhaar > Voice)
                    self._update_entry(key, new_val, new_conf, source_type)
                
                elif new_source_score < existing_score:
                    # Lower authority never overwrites Higher (e.g. Voice cannot overwrite Aadhaar)
                    # UNLESS the existing value was empty/null (handled by 'if key not in self.store')
                    # But here key IS in store. So we keep existing.
                    continue
                
                else:
                    # B. Equal Trust (e.g. Aadhaar vs Aadhaar, or Voice vs Voice)
                    # Tie-breaker: Policy Specifics
                    
                    if policy == "address_logic":
                        # Prefer longer address if confidence is reasonable
                        # (Assume longer string = more detail)
                        if len(str(new_val)) > len(str(existing_val)) and new_conf > 0.5:
                            self._update_entry(key, new_val, new_conf, source_type)
                        elif new_conf > existing_conf:
                             # Fallback to confidence
                            self._update_entry(key, new_val, new_conf, source_type)
                    
                    else:
                        # Standard Friend: Highest Confidence Wins
                        # Ensure float
                        n_c = float(new_conf) if new_conf is not None else 0.0
                        e_c = float(existing_conf) if existing_conf is not None else 0.0
                        
                        if n_c > e_c:
                            self._update_entry(key, new_val, new_conf, source_type)

    def _update_entry(self, key, value, confidence, source):
        self.store[key] = {
            "value": value,
            "confidence": confidence,
            "source": source
        }

    def get_final_state(self):
        """
        Returns final state including source metadata.
        """
        return {
            "values": {k: v["value"] for k, v in self.store.items()},
            "confidences": {k: v["confidence"] for k, v in self.store.items()},
            "sources": {k: v.get("source", "unknown") for k, v in self.store.items()}
        }
    
    def get_session_view(self):
        """
        Returns entity data in flat format expected by frontend.
        Each key contains value, confidence, and source in a single object.
        """
        return self.store.copy()

# Unit Test (Updated)
if __name__ == "__main__":
    import sys
    sys.path.append(os.getcwd())
    # Utils import might need this if run directly
    
    store = EntityStore()
    
    # 1. Aadhaar (High Trust)
    doc1 = {
        "full_name": {"value": "Abhishek Dixit", "confidence": 0.99},
        "date_of_birth": {"value": "2004-09-27", "confidence": 0.99},
        "address": {"value": "H.No 123, Some Village, District Kanpur Nagar, UP", "confidence": 0.90}
    }
    store.merge_entities(doc1, source_type="aadhaar")
    
    # 2. Voice (Low Trust) - Should NOT overwrite Name/DOB, but MIGHT overwrite Address if policy failed (but we fixed it)
    doc2 = {
        "full_name": {"value": "Abhishek Kumar Dixit", "confidence": 1.0}, # Voice often hallucinates middle names
        "date_of_birth": {"value": "1278", "confidence": 0.5},
        "address": {"value": "Kanpur", "confidence": 1.0} # Short address
    }
    store.merge_entities(doc2, source_type="voice")
    
    final = store.get_final_state()
    values = final["values"]
    sources = final["sources"]
    
    print("Final Values:", json.dumps(values, indent=2))
    print("Final Sources:", json.dumps(sources, indent=2))
    
    # Assertions
    assert values["full_name"] == "Abhishek Dixit", "Voice should not overwrite Aadhaar Name"
    assert sources["full_name"] == "aadhaar"
    
    assert values["address"] != "Kanpur", "Short Voice address should not overwrite Long Aadhaar address"
    assert "Kanpur Nagar" in values["address"]
    
    print("✅ Logic Verified!")
    
    # Test Normalization
    print("Testing Date Normalization...")
    # New store for clean test
    store2 = EntityStore()
    doc_raw_date = {
        "date_of_birth": {"value": "14112022", "confidence": 0.9} # DDMMYYYY
    }
    store2.merge_entities(doc_raw_date, source_type="pan")
    
    final2 = store2.get_final_state()
    dob_val = final2["values"]["date_of_birth"]
    print(f"Raw: 14112022 -> Normalized: {dob_val}")
    
    assert dob_val == "2022-11-14", f"Date Normalization failed. Got {dob_val}"
    print("✅ Normalization Verified!")
