"""
generate_dataset.py
Generates realistic NSL-KDD cybersecurity benchmark datasets (train, test, and sample upload).
Includes all 41 NSL-KDD network traffic attributes plus label.
"""

import os
import pandas as pd
import numpy as np

COLUMNS = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
    'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
    'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
    'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
    'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
    'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
    'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
    'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
    'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label'
]

ATTACK_TYPES = ['neptune', 'smurf', 'portsweep', 'ipsweep', 'satan', 'teardrop', 'warezclient', 'guess_passwd']

def generate_record(is_attack: bool, rng: np.random.RandomState):
    if not is_attack:
        label = 'normal'
        protocol = rng.choice(['tcp', 'udp', 'icmp'], p=[0.75, 0.20, 0.05])
        if protocol == 'tcp':
            service = rng.choice(['http', 'smtp', 'ftp', 'ssh', 'domain_u'], p=[0.55, 0.15, 0.10, 0.10, 0.10])
            flag = rng.choice(['SF', 'S0', 'REJ'], p=[0.92, 0.05, 0.03])
        elif protocol == 'udp':
            service = 'domain_u'
            flag = 'SF'
        else:
            service = 'eco_i'
            flag = 'SF'
        
        src_bytes = int(rng.lognormal(mean=5.5, sigma=1.2))
        dst_bytes = int(rng.lognormal(mean=7.0, sigma=1.4))
        count = int(rng.geometric(p=0.25))
        srv_count = max(1, int(count * rng.uniform(0.6, 1.0)))
        serror_rate = float(rng.beta(0.5, 10.0))
        srv_serror_rate = float(serror_rate * rng.uniform(0.8, 1.0))
        rerror_rate = float(rng.beta(0.5, 15.0))
        srv_rerror_rate = float(rerror_rate * rng.uniform(0.8, 1.0))
        same_srv_rate = float(rng.beta(8.0, 1.5))
        diff_srv_rate = float(max(0.0, 1.0 - same_srv_rate))
        logged_in = 1 if protocol == 'tcp' and service in ['http', 'smtp', 'ftp'] and rng.rand() > 0.1 else 0
        num_compromised = 0
        root_shell = 0
        num_failed_logins = 1 if rng.rand() < 0.02 else 0
    else:
        label = rng.choice(ATTACK_TYPES)
        if label in ['neptune', 'smurf', 'teardrop']: # DoS
            protocol = 'tcp' if label == 'neptune' else ('icmp' if label == 'smurf' else 'udp')
            service = 'private' if label == 'neptune' else ('eco_i' if label == 'smurf' else 'other')
            flag = 'S0' if label == 'neptune' else 'SF'
            src_bytes = int(rng.uniform(0, 50)) if label != 'smurf' else 1032
            dst_bytes = 0
            count = int(rng.uniform(150, 450))
            srv_count = int(rng.uniform(10, 150))
            serror_rate = 1.0 if label == 'neptune' else 0.0
            srv_serror_rate = serror_rate
            rerror_rate = 0.0
            srv_rerror_rate = 0.0
            same_srv_rate = float(rng.uniform(0.05, 0.35))
            diff_srv_rate = float(rng.uniform(0.65, 0.95))
            logged_in = 0
            num_compromised = 0
            root_shell = 0
            num_failed_logins = 0
        elif label in ['portsweep', 'ipsweep', 'satan']: # Probe
            protocol = rng.choice(['tcp', 'icmp'])
            service = rng.choice(['private', 'other', 'eco_i'])
            flag = rng.choice(['REJ', 'RSTO', 'S0'])
            src_bytes = int(rng.uniform(0, 120))
            dst_bytes = int(rng.uniform(0, 60))
            count = int(rng.uniform(50, 250))
            srv_count = int(rng.uniform(1, 15))
            serror_rate = float(rng.uniform(0.1, 0.7))
            srv_serror_rate = serror_rate
            rerror_rate = float(rng.uniform(0.3, 0.9))
            srv_rerror_rate = rerror_rate
            same_srv_rate = float(rng.uniform(0.01, 0.2))
            diff_srv_rate = float(rng.uniform(0.7, 0.99))
            logged_in = 0
            num_compromised = 0
            root_shell = 0
            num_failed_logins = 0
        else: # R2L / U2R
            protocol = 'tcp'
            service = rng.choice(['ftp', 'telnet', 'smtp'])
            flag = 'SF'
            src_bytes = int(rng.uniform(500, 4000))
            dst_bytes = int(rng.uniform(1000, 6000))
            count = int(rng.uniform(1, 10))
            srv_count = int(rng.uniform(1, 8))
            serror_rate = 0.0
            srv_serror_rate = 0.0
            rerror_rate = 0.0
            srv_rerror_rate = 0.0
            same_srv_rate = 1.0
            diff_srv_rate = 0.0
            logged_in = 1 if rng.rand() > 0.4 else 0
            num_failed_logins = int(rng.choice([1, 2, 3])) if rng.rand() > 0.4 else 0
            num_compromised = int(rng.choice([1, 2])) if rng.rand() > 0.5 else 0
            root_shell = 1 if rng.rand() > 0.7 else 0

    return {
        'duration': int(rng.exponential(scale=1.5)),
        'protocol_type': protocol,
        'service': service,
        'flag': flag,
        'src_bytes': src_bytes,
        'dst_bytes': dst_bytes,
        'land': 0,
        'wrong_fragment': 0,
        'urgent': 0,
        'hot': 0,
        'num_failed_logins': num_failed_logins,
        'logged_in': logged_in,
        'num_compromised': num_compromised,
        'root_shell': root_shell,
        'su_attempted': 0,
        'num_root': 0,
        'num_file_creations': 0,
        'num_shells': 0,
        'num_access_files': 0,
        'num_outbound_cmds': 0,
        'is_host_login': 0,
        'is_guest_login': 0,
        'count': count,
        'srv_count': srv_count,
        'serror_rate': round(serror_rate, 2),
        'srv_serror_rate': round(srv_serror_rate, 2),
        'rerror_rate': round(rerror_rate, 2),
        'srv_rerror_rate': round(srv_rerror_rate, 2),
        'same_srv_rate': round(same_srv_rate, 2),
        'diff_srv_rate': round(diff_srv_rate, 2),
        'srv_diff_host_rate': round(float(rng.beta(1.5, 4.0)), 2),
        'dst_host_count': int(rng.uniform(10, 255)),
        'dst_host_srv_count': int(rng.uniform(5, 255)),
        'dst_host_same_srv_rate': round(float(rng.uniform(0.1, 1.0)), 2),
        'dst_host_diff_srv_rate': round(float(rng.uniform(0.0, 0.4)), 2),
        'dst_host_same_src_port_rate': round(float(rng.uniform(0.0, 0.5)), 2),
        'dst_host_srv_diff_host_rate': round(float(rng.uniform(0.0, 0.2)), 2),
        'dst_host_serror_rate': round(serror_rate, 2),
        'dst_host_srv_serror_rate': round(srv_serror_rate, 2),
        'dst_host_rerror_rate': round(rerror_rate, 2),
        'dst_host_srv_rerror_rate': round(srv_rerror_rate, 2),
        'label': label
    }

def create_dataset(n_samples: int, seed: int = 42, attack_ratio: float = 0.45):
    rng = np.random.RandomState(seed)
    records = []
    for _ in range(n_samples):
        is_attack = (rng.rand() < attack_ratio)
        records.append(generate_record(is_attack, rng))
    return pd.DataFrame(records)[COLUMNS]

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Training dataset (400 samples: fast simulation yet statistically meaningful)
    train_df = create_dataset(400, seed=101, attack_ratio=0.48)
    train_path = os.path.join(data_dir, 'nsl_kdd_train.csv')
    train_df.to_csv(train_path, index=False)
    print(f"Generated train dataset: {train_path} ({len(train_df)} rows)")

    # 2. Benchmark test dataset (120 samples: fair identical comparison)
    test_df = create_dataset(120, seed=202, attack_ratio=0.50)
    test_path = os.path.join(data_dir, 'nsl_kdd_test.csv')
    test_df.to_csv(test_path, index=False)
    print(f"Generated test dataset: {test_path} ({len(test_df)} rows)")

    # 3. Sample test upload dataset (25 samples)
    sample_df = create_dataset(25, seed=303, attack_ratio=0.44)
    sample_path = os.path.join(data_dir, 'sample_traffic.csv')
    sample_df.to_csv(sample_path, index=False)
    print(f"Generated sample upload dataset: {sample_path} ({len(sample_df)} rows)")
