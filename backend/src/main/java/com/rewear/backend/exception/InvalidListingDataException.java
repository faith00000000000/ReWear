package com.rewear.backend.exception;

/**
 * Thrown when a listing payload fails business-rule validation that can't
 * be expressed with bean-validation annotations alone — e.g. conditional
 * "required if deliveryOption is X" fields.
 */
public class InvalidListingDataException extends RuntimeException {
    public InvalidListingDataException(String message) {
        super(message);
    }
}