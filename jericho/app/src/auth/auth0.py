import base64
import struct

import requests
import six
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers

from src.config import auth0_domain


# Define a function to get the RSA public key from the JWKS
def get_rsa_public_key(token):
    # Auth0 JWKS URL
    jwks_url = auth0_domain + ".well-known/jwks.json"

    # Fetch the JWKS from Auth0
    jwks_response = requests.get(jwks_url)
    jwks_data = jwks_response.json()

    rsa_key = {}
    for key in jwks_data["keys"]:
        if key["kid"] == token["kid"]:
            rsa_key = key
    return rsa_key


def intarr2long(arr):
    return int("".join(["%02x" % byte for byte in arr]), 16)


def base64_to_long(data):
    if isinstance(data, six.text_type):
        data = data.encode("ascii")

    # urlsafe_b64decode will happily convert b64encoded data
    _d = base64.urlsafe_b64decode(bytes(data) + b"==")
    return intarr2long(struct.unpack("%sB" % len(_d), _d))


def jwk_to_pem(jwk):
    exponent = base64_to_long(jwk["e"])
    modulus = base64_to_long(jwk["n"])
    numbers = RSAPublicNumbers(exponent, modulus)
    public_key = numbers.public_key(backend=default_backend())
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return pem
